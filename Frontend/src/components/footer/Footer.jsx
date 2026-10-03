import React from "react";
import { Link } from "react-router-dom";
import DeckleLogo from "../common/DeckleLogo";

export default function Footer() {
  return (
    <footer className="w-full bg-card border-t border-border-subtle/50 mt-16 transition-colors">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12">
        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-border-subtle/40">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DeckleLogo className="h-6 w-6 text-accent" />
              <span className="font-serif text-2xl text-accent font-semibold">
                Deckle
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              An immersive, distraction-free serialized fiction reader blending
              tactile print editorial grace with low-friction digital
              ergonomics.
            </p>
          </div>

          {/* Discovery Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-text-main font-semibold">
              Discovery
            </h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>
                <Link to="/" className="hover:text-accent transition-colors">
                  Browse Web Novels
                </Link>
              </li>
              <li>
                <Link to="/rankings" className="hover:text-accent transition-colors">
                  Weekly Power Rankings
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-accent transition-colors">
                  New Serial Releases
                </Link>
              </li>
            </ul>
          </div>

          {/* Authors Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-text-main font-semibold">
              Authors
            </h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>
                <Link to="/studio" className="hover:text-accent transition-colors">
                  Author Dashboard
                </Link>
              </li>
              <li>
                <Link to="/studio" className="hover:text-accent transition-colors">
                  Publishing Guidelines
                </Link>
              </li>
              <li>
                <Link to="/studio" className="hover:text-accent transition-colors">
                  Creator Monetization
                </Link>
              </li>
            </ul>
          </div>

          {/* Experience Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-text-main font-semibold">
              Experience
            </h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>
                <Link to="/preferences" className="hover:text-accent transition-colors">
                  Typography & Themes
                </Link>
              </li>
              <li>
                <Link to="/library" className="hover:text-accent transition-colors">
                  Reading Lists & Sync
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-accent transition-colors">
                  Reader Circles
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© 2024 Deckle Serialized Literature. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-text-main transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-text-main transition-colors">
              Terms of Service
            </Link>
            <Link to="/guidelines" className="hover:text-text-main transition-colors">
              Content Guidelines
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
