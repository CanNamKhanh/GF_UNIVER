'use client';

import { Component } from 'react';
import type { ReactNode } from 'react';

interface TextureErrorBoundaryProps {
  children: ReactNode;
  /** When this changes (e.g. the image URL was edited), a failed card gets another try. */
  resetKey: string;
}

interface TextureErrorBoundaryState {
  hasError: boolean;
}

export class TextureErrorBoundary extends Component<
  TextureErrorBoundaryProps,
  TextureErrorBoundaryState
> {
  state: TextureErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): TextureErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.warn('[memory-universe] Không tải được ảnh cho khung hình:', error.message);
  }

  componentDidUpdate(prevProps: TextureErrorBoundaryProps): void {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render(): ReactNode {
    return this.state.hasError ? null : this.props.children;
  }
}
