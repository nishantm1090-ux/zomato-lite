"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// A tiny raw-WebGL celebration: warm amber stars drift up off the card.
// No libraries — one vertex shader, one fragment shader, one point buffer.

const VERTEX_SHADER = `
attribute vec2 a_position;
attribute float a_size;
attribute float a_phase;
varying float v_phase;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  gl_PointSize = a_size;
  v_phase = a_phase;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
varying float v_phase;
uniform float u_time;
uniform vec3 u_warm;
uniform vec3 u_light;
void main() {
  vec2 p = gl_PointCoord - vec2(0.5);
  float d = length(p) * 2.0;
  float glow = smoothstep(1.0, 0.0, d);          // soft round core
  float flare = exp(-6.0 * abs(p.x)) * exp(-6.0 * abs(p.y)); // plus-shaped glint
  float alpha = max(glow, 0.45 * flare);
  float twinkle = 0.7 + 0.3 * sin(u_time * 2.0 + v_phase * 6.2831);
  vec3 tint = mix(u_warm, u_light, fract(v_phase * 1.618));
  gl_FragColor = vec4(tint, alpha * twinkle);
}
`;

const COUNT = 140;
const REDIRECT_MS = 3400;

export function Celebration({ restaurantId }: { restaurantId: number }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webgl, setWebgl] = useState(true);

  // Give the moment a beat, then take the reviewer to their live review.
  useEffect(() => {
    const timer = setTimeout(
      () => router.push(`/restaurant/${restaurantId}`),
      REDIRECT_MS,
    );
    return () => clearTimeout(timer);
  }, [router, restaurantId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { alpha: true, antialias: false });
    if (!canvas || !gl) {
      setWebgl(false);
      return;
    }
    // Concrete non-null alias — closures don't inherit the narrowed type.
    const ctx: WebGLRenderingContext = gl;
    const el: HTMLCanvasElement = canvas;

    function compile(type: number, source: string) {
      const shader = ctx.createShader(type)!;
      ctx.shaderSource(shader, source);
      ctx.compileShader(shader);
      if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
        console.error(ctx.getShaderInfoLog(shader));
        ctx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertex = compile(ctx.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(ctx.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertex || !fragment) {
      setWebgl(false);
      return;
    }

    const program = ctx.createProgram()!;
    ctx.attachShader(program, vertex);
    ctx.attachShader(program, fragment);
    ctx.linkProgram(program);
    if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
      console.error(ctx.getProgramInfoLog(program));
      setWebgl(false);
      return;
    }
    ctx.useProgram(program);

    const positionLoc = ctx.getAttribLocation(program, "a_position");
    const sizeLoc = ctx.getAttribLocation(program, "a_size");
    const phaseLoc = ctx.getAttribLocation(program, "a_phase");
    const timeLoc = ctx.getUniformLocation(program, "u_time");
    const warmLoc = ctx.getUniformLocation(program, "u_warm");
    const lightLoc = ctx.getUniformLocation(program, "u_light");

    // Each particle is four floats: x, y, size, phase.
    const WIDTH = 4;
    const data = new Float32Array(COUNT * WIDTH);
    const buffer = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
    ctx.bufferData(ctx.ARRAY_BUFFER, data, ctx.DYNAMIC_DRAW);

    ctx.enableVertexAttribArray(positionLoc);
    ctx.vertexAttribPointer(positionLoc, 2, ctx.FLOAT, false, WIDTH * 4, 0);
    ctx.enableVertexAttribArray(sizeLoc);
    ctx.vertexAttribPointer(sizeLoc, 1, ctx.FLOAT, false, WIDTH * 4, 8);
    ctx.enableVertexAttribArray(phaseLoc);
    ctx.vertexAttribPointer(phaseLoc, 1, ctx.FLOAT, false, WIDTH * 4, 12);

    const stars = Array.from({ length: COUNT }, () => ({
      x: -1 + Math.random() * 2,
      y: -0.5 - Math.random() * 0.7,
      speed: 0.00035 + Math.random() * 0.0005,
      drift: (Math.random() - 0.5) * 0.00015,
      phase: Math.random() * Math.PI * 2,
    }));

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      el.width = Math.max(1, Math.round(el.clientWidth * dpr));
      el.height = Math.max(1, Math.round(el.clientHeight * dpr));
      ctx.viewport(0, 0, el.width, el.height);
    }
    resize();
    window.addEventListener("resize", resize);

    ctx.enable(ctx.BLEND);
    ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE); // additive: warm glow on dark
    ctx.clearColor(0, 0, 0, 0);

    ctx.uniform3f(warmLoc, 0.961, 0.62, 0.043); // #f59e0b
    ctx.uniform3f(lightLoc, 0.992, 0.827, 0.302); // #fcd34d

    let raf = 0;
    let running = true;

    function tick(now: number) {
      if (!running) return;
      const t = now * 0.001;
      for (let i = 0; i < COUNT; i++) {
        const s = stars[i];
        s.y += s.speed * 16;
        s.x += s.drift * 16;
        if (s.y > 1.2) {
          s.y = -0.55 - Math.random() * 0.6;
          s.x = -1 + Math.random() * 2;
        }
        const o = i * WIDTH;
        data[o] = s.x;
        data[o + 1] = s.y;
        data[o + 2] = (7 + Math.random() * 9) * dpr; // shimmer the size
        data[o + 3] = s.phase + t;
      }
      ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
      ctx.bufferSubData(ctx.ARRAY_BUFFER, 0, data);
      ctx.uniform1f(timeLoc, t);
      ctx.clear(ctx.COLOR_BUFFER_BIT);
      ctx.drawArrays(ctx.POINTS, 0, COUNT);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ctx.deleteBuffer(buffer);
      ctx.deleteProgram(program);
      ctx.deleteShader(vertex);
      ctx.deleteShader(fragment);
      ctx.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <section className="card overflow-hidden">
      {webgl ? (
        <canvas
          ref={canvasRef}
          aria-label="Celebration animation"
          className="block h-40 w-full sm:h-44"
        />
      ) : (
        /* WebGL unavailable: a calm static stand-in, same intent. */
        <div
          aria-hidden="true"
          className="flex h-40 w-full items-center justify-center gap-1 text-2xl text-accent"
        >
          ★★★★★
        </div>
      )}
      <div className="p-6 pt-2 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Review submitted
        </h2>
        <p className="mt-1 text-sm text-muted">
          Thanks &mdash; it&apos;s live on the board.
        </p>
        <button
          type="button"
          onClick={() => router.push(`/restaurant/${restaurantId}`)}
          className="btn-primary mt-5"
        >
          See your review
        </button>
        <p className="mt-3 text-xs text-muted">
          Taking you there automatically&hellip;
        </p>
      </div>
    </section>
  );
}