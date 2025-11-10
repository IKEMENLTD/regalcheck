// PDF.js がサーバーサイドで動作するためのポリフィル

// DOMMatrixのモック実装
if (typeof globalThis.DOMMatrix === 'undefined') {
  class DOMMatrixPolyfill {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;

    constructor(init?: string | number[]) {
      // 単位行列で初期化
      this.a = 1;
      this.b = 0;
      this.c = 0;
      this.d = 1;
      this.e = 0;
      this.f = 0;

      if (Array.isArray(init)) {
        this.a = init[0] || 1;
        this.b = init[1] || 0;
        this.c = init[2] || 0;
        this.d = init[3] || 1;
        this.e = init[4] || 0;
        this.f = init[5] || 0;
      }
    }

    translate(tx: number, ty: number): DOMMatrixPolyfill {
      const result = new DOMMatrixPolyfill();
      result.a = this.a;
      result.b = this.b;
      result.c = this.c;
      result.d = this.d;
      result.e = this.a * tx + this.c * ty + this.e;
      result.f = this.b * tx + this.d * ty + this.f;
      return result;
    }

    scale(scaleX: number, scaleY?: number): DOMMatrixPolyfill {
      const sy = scaleY !== undefined ? scaleY : scaleX;
      const result = new DOMMatrixPolyfill();
      result.a = this.a * scaleX;
      result.b = this.b * scaleX;
      result.c = this.c * sy;
      result.d = this.d * sy;
      result.e = this.e;
      result.f = this.f;
      return result;
    }

    multiply(other: DOMMatrixPolyfill): DOMMatrixPolyfill {
      const result = new DOMMatrixPolyfill();
      result.a = this.a * other.a + this.c * other.b;
      result.b = this.b * other.a + this.d * other.b;
      result.c = this.a * other.c + this.c * other.d;
      result.d = this.b * other.c + this.d * other.d;
      result.e = this.a * other.e + this.c * other.f + this.e;
      result.f = this.b * other.e + this.d * other.f + this.f;
      return result;
    }

    inverse(): DOMMatrixPolyfill {
      const det = this.a * this.d - this.b * this.c;
      if (det === 0) {
        throw new Error('Matrix is not invertible');
      }

      const result = new DOMMatrixPolyfill();
      result.a = this.d / det;
      result.b = -this.b / det;
      result.c = -this.c / det;
      result.d = this.a / det;
      result.e = (this.c * this.f - this.d * this.e) / det;
      result.f = (this.b * this.e - this.a * this.f) / det;
      return result;
    }

    transformPoint(point: { x: number; y: number }): { x: number; y: number } {
      return {
        x: this.a * point.x + this.c * point.y + this.e,
        y: this.b * point.x + this.d * point.y + this.f,
      };
    }

    toString(): string {
      return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
    }
  }

  // @ts-ignore
  globalThis.DOMMatrix = DOMMatrixPolyfill;
  console.log('✅ DOMMatrix polyfill installed');
}

// Path2Dのモック（PDF.jsが必要とする場合）
if (typeof globalThis.Path2D === 'undefined') {
  class Path2DPolyfill {
    constructor(path?: string | Path2DPolyfill) {
      // 何もしない（モックとして機能）
    }
  }
  // @ts-ignore
  globalThis.Path2D = Path2DPolyfill;
  console.log('✅ Path2D polyfill installed');
}

// CanvasGradientのモック
if (typeof globalThis.CanvasGradient === 'undefined') {
  class CanvasGradientPolyfill {
    addColorStop(offset: number, color: string): void {
      // 何もしない
    }
  }
  // @ts-ignore
  globalThis.CanvasGradient = CanvasGradientPolyfill;
  console.log('✅ CanvasGradient polyfill installed');
}

// CanvasPatternのモック
if (typeof globalThis.CanvasPattern === 'undefined') {
  class CanvasPatternPolyfill {}
  // @ts-ignore
  globalThis.CanvasPattern = CanvasPatternPolyfill;
  console.log('✅ CanvasPattern polyfill installed');
}

export {}; // このファイルをモジュールとして扱う
