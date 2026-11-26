import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let displayMsg = 'เกิดข้อผิดพลาดในการแสดงผล กรุณารีโหลดหน้าเว็บอีกครั้ง';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed.error === 'string') {
        if (parsed.error.toLowerCase().includes('permission')) {
          displayMsg =
            'บัญชีของคุณไม่มีสิทธิ์เข้าถึงข้อมูลส่วนนี้ หรือยังไม่ได้ยืนยันอีเมล Google';
        } else {
          displayMsg = parsed.error;
        }
      }
    } catch {
      if (error.message) displayMsg = error.message;
    }
    return { hasError: true, message: displayMsg };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFF7ED] dark:bg-[#14100E] px-4">
          <div className="max-w-md w-full rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/40 p-8 text-center shadow-lg space-y-4">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto" />
            <h1 className="font-display font-bold text-xl text-[#1E1B18] dark:text-orange-50">
              ขออภัย ระบบพบข้อผิดพลาดชั่วคราว
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {this.state.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              โหลดหน้าใหม่
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
