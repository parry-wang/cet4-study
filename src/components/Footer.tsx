import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-900/12 bg-paper-50">
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-display text-2xl font-black tracking-tightest text-ink-900">
                砚墨
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-wine-500">
                CET-4 Studio
              </span>
            </div>
            <p className="font-serif text-sm text-ink-400 leading-relaxed max-w-xs">
              以编辑杂志之典雅，承大学英语四级之精进。每日五十词，积水成渊。
            </p>
          </div>

          {/* Modules */}
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400 mb-4">
              Modules
            </h4>
            <ul className="space-y-2 font-serif text-sm">
              <li><Link to="/vocabulary" className="text-ink-700 hover:text-wine-500">单词背诵</Link></li>
              <li><Link to="/listening" className="text-ink-700 hover:text-wine-500">听力播报</Link></li>
              <li><Link to="/reading" className="text-ink-700 hover:text-wine-500">阅读理解</Link></li>
              <li><Link to="/writing" className="text-ink-700 hover:text-wine-500">作文书写</Link></li>
              <li><Link to="/papers" className="text-ink-700 hover:text-wine-500">试卷生成</Link></li>
            </ul>
          </div>

          {/* Meta */}
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400 mb-4">
              Studio Notes
            </h4>
            <p className="font-serif text-sm text-ink-700 leading-relaxed">
              词库共 250 词，每日 50 词定点更新；错题按 1·2·4·7 日间隔重复，直至掌握。
            </p>
            <p className="font-mono text-[10px] text-ink-400 mt-4">
              © 2026 砚墨 CET-4 Studio · Local-first Learning
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
