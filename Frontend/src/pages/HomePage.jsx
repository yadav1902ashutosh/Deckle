import React, { useState } from "react";
import HeroSpotlight from "../components/home/HeroSpotlight";
import FilterBar from "../components/home/FilterBar";
import BookCard from "../components/books/BookCard";
import CatalogPagination from "../components/home/CatalogPagination";
import RankingsSidebar from "../components/home/RankingsSidebar";
import LiveSerialPulse from "../components/home/LiveSerialPulse";
import TrendingMotifs from "../components/home/TrendingMotifs";
import ReadingGoalWidget from "../components/home/ReadingGoalWidget";
import { LayoutGrid, List } from "lucide-react";

// Exact 8 Curated Serials from Stitch Design
export const STITCH_CATALOG = [
  {
    id: "1",
    slug: "battle-through-the-heavens",
    title: "Battle Through the Heavens",
    author_name: "Tiancan Tudou (天蚕土豆)",
    cover_image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCxQ6JTnU9iddzuCaRDfCxeR33Kf5RBRnWnvKflDyE9r4SbpTKJs8_vOyxL7zPCVW4FbMolNyuTXmzP4t86GlIlAlllRLfeuZuWzhH8lCh5Sc78R712sJJHqJoRoKPqDrKRsSpe2UHJw0jOCR-aTBG7yE_OzSEtHChu5rTxiwZTMXhWj7lejEtKtD5GKHOO2nfJI64TuXE4h-miMPEpMG9x0UkmChbs-Pu1QvcUEdyXJ_O90Ty-Hj5i",
    badge: "Classic",
    rating: "9.6",
    reviewsCount: "112k",
    wordCount: "7.1M",
    status: "completed",
    description:
      "Here, there is no magic; only Dou Qi that has trained to its zenith! The fall of a genius into an outcast, until the ring upon his finger awakened...",
    latest_chapter_title: "Ch. 1648: Flame Emperor (Final)",
    latest_chapter_time: "Archived",
    tags: ["Xuanhuan", "Eastern Fantasy"],
  },
  {
    id: "2",
    slug: "how-did-i-become-invincible",
    title: "How Did I Become Invincible?",
    author_name: "Xinfeng (新丰)",
    cover_image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCdTstXXl9AgAbge-_Wiz_BLwjloKp6QcjdIYtpQQwFnvWo3erR_NfIy-9NW12IowsuT5GpvjGP9GG6zsyfM0id0EL5wfGm3kzVr-U3JEOLPVg-WShtMQUnT5ZxDNtTxc3hD7VBGcrd03Zp3fTq13ntDcVGqJkbafS1y2tkjLbuo6WDtzG0uVa1X4-1jw-ZWWzfylRo20qlwC9dxaQreM-LPZMooefhDLvzZceelBebtVwRYjk5h7qf",
    badge: "Hot",
    rating: "9.4",
    reviewsCount: "38k",
    wordCount: "1.05M",
    status: "ongoing",
    description:
      "I was clearly just an ordinary disciple doing morning drills. Why does everyone gaze upon me like an ancient primordial god descending?",
    latest_chapter_title: "Ch. 412: The Grand Supreme Senior",
    latest_chapter_time: "2h ago",
    tags: ["Cultivation", "Comedy"],
  },
  {
    id: "3",
    slug: "xuanhuang-ding",
    title: "Xuanhuang Ding",
    author_name: "Nine Cauldron Master (九鼎散人)",
    cover_image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCtKRpLkYMEZZNoBv-Yur6mctP2Lxi8FXtVzox13H21pjvDSiHMvNWVJUwkXk_kD1CDzB6M_5sk-tR1qYBVXQBKqUFqEhFdNsQAiQ5GOduFLILq75OqdPg184XPtS2IQSHt4BL0qboHNRXJ5cdPjQRWd8xv1Ei7kw2Rfj3dERMMq0iwbQjoU2LVblaPQXWyIshWbavF6beBK_5lH3FJwMbH5cUsj37rSkoAxAsmkq3OlTmnlRLhYYSL",
    badge: null,
    rating: "9.7",
    reviewsCount: "64k",
    wordCount: "6.2M",
    status: "ongoing",
    description:
      "A single wisp of Mother Qi can crush a stellar galaxy. With the primal cauldron inside his Dantian, he refines myriad worlds into celestial pills.",
    latest_chapter_title: "Ch. 1892: Smelting the Star River",
    latest_chapter_time: "5h ago",
    tags: ["Xianxia", "Cultivation"],
  },
  {
    id: "4",
    slug: "green-mountain",
    title: "Green Mountain",
    author_name: "Mao Ni (猫腻)",
    cover_image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAUamZzYpipWQW7qwat3EUv7d2qWK3PY-g_jeSwRE765pVscX4PcyymEmeQ5heseIdmPWu5bWqSHBCJ7WG_WKHDhTUs0o-HCtz7zacUwoKOv8yJiMFBAvieqaMhCqFq1OXapo12ixJuSwF66iUkiAXl1IM4iDZGuzgDPNP_3bbr0ofO6zu6w0HITUPcvv3kbsf7MBqADTsF5060YeNMqUO5fc0w8pp7TJp2jf8e_vuKFDSA8GLyu9vv",
    badge: null,
    rating: "9.8",
    reviewsCount: "92k",
    wordCount: "3.3M",
    status: "completed",
    description:
      "Across three lives and endless snows upon the ninth peak, the Path of Ascension was never meant to escape mortality, but to face it without regret.",
    latest_chapter_title: "Epilogue: The Pine Stood Quiet",
    latest_chapter_time: "Archived",
    tags: ["Cultivation", "Philosophical"],
  },
  {
    id: "5",
    slug: "cornflower-witch",
    title: "Cornflower Witch",
    author_name: "Sable Quill (黑羽)",
    cover_image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC1dnk1CuYP4guZzfjOb2o1xs1OoraKLlJRJDhme2QpzmlESmo7HkTfglXofZQoYSGxfiTVJIHiwXQ7cnUzef73KwXcMc4BVNHMPvL-g5Wc-WcYVVazGbCRMtcxplOtY_DJnLZct2PYAfbHh0vobO2D8mzSKpa3KPiHjQ6_jZE3et1aLjoA023HJT60pVRpE3shI43y89k15gkEkuA99CGhy-wdEiSTKE1wjbv4LzhwbwPdouBHXaXp",
    badge: "Supernatural",
    rating: "9.5",
    reviewsCount: "29k",
    wordCount: "2.4M",
    status: "ongoing",
    description:
      "Transmigrated as an apothecary's illegitimate apprentice in a gaslit metropolis where Eldritch horrors whisper through church gargoyles...",
    latest_chapter_title: "Ch. 784: The Glass Bell Sings",
    latest_chapter_time: "1d ago",
    tags: ["Urban Supernatural"],
  },
  {
    id: "6",
    slug: "nine-revolutions-devouring-heaven",
    title: "Nine Revolutions Devouring Heaven",
    author_name: "Dragon Sovereign (龙君)",
    cover_image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDh4kxlnK0m3Sxj7slPu1A8WViXQNDUgHm5jSqDvfto6DimoA20z4ZDPwoAlz2XSGqcuuUfkQtugkdOboaNongG3OGUTEInmpp0HlTJ7PQKxu2V1eFczB9OkyZ4vDFrX_xV4B9EePVTgkGB5DHc02z3yMBVqXE8ORRsW0APu2jV4LKiCkK-IhDEPiX-REIned6X0woJj-lbH3qUjd4VbfUL8B1gYmCvlBJsnAhAVgZpp72lPvoaFlJj",
    badge: null,
    rating: "9.3",
    reviewsCount: "78k",
    wordCount: "10.5M",
    status: "ongoing",
    description:
      "Devour earth, devour heaven, devour reincarnation itself! When the divine sects betrayed him, Chu Yan woke the ancestral beast inside his bloodline.",
    latest_chapter_title: "Ch. 3420: Dragon Gate Ascension",
    latest_chapter_time: "3h ago",
    tags: ["Xuanhuan", "Action"],
  },
  {
    id: "7",
    slug: "asura-martial-god",
    title: "Asura Martial God",
    author_name: "Kindhearted Bee (善良的蜜蜂)",
    cover_image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuANv0aavfUQBk6ooJbbC6uHPbtAeQ76yGTnHENYHTORN8qMQXE8qNj_8kgoyHskarsa879WiPOuIkm2u2VfMnwJyIeUWeEuUwVFbkTo4vxPrisPRTsrMzHGHSxLYic-WZ8CgCCHWunU6gzeld-vcAlsa3_TAj5fffqbSypWhR3xuA-cv2MUZ3jYNY253afIUSCpLrqigESm2p_tzwEwTOryJm8N5n8qAbtdxHOzhFq_mk37XaGTRZ4s",
    badge: "Titan",
    rating: "9.1",
    reviewsCount: "145k",
    wordCount: "22.2M",
    status: "ongoing",
    description:
      "Even if I am deemed a demon by the nine heavens, the lightning inside my blood shall illuminate every dark corner of this continent!",
    latest_chapter_title: "Ch. 5891: The True Ancestral Land",
    latest_chapter_time: "42m ago",
    tags: ["Eastern Xianxia", "Action"],
  },
  {
    id: "8",
    slug: "mortals-journey",
    title: "Mortal's Journey to Immortality",
    author_name: "Wang Yu (忘语)",
    cover_image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDmmIXB0oW32-5bcOt7TpCp6s1ArPN48bXoCQTXFlOFWMARIzfBS9ox7hXvefy7aoa2dxRtwsJPsaHrO4IscdrkCNpNYU_hamIlURE3iOw3xH8Ckyh1V47T8fslengIBn_Tv6tImldh9g_o1mD35XSd1upznnDweRPSG3gN44Sv50Bg0jvohMpsjAXB7dWqDlEOFx8nsKYXZw7rn7qpoveRmbyTNaKxDAbZNVZ_Rm5glHBYxK7d6OJZ",
    badge: "Monument",
    rating: "9.9",
    reviewsCount: "210k",
    wordCount: "7.4M",
    status: "completed",
    description:
      "A poor, ordinary village youth named Han Li joins a small sect in jianghu by chance. Though his aptitude is mediocre, he strives toward immortality with caution...",
    latest_chapter_title: "Epilogue: The Vast Immortal Realm",
    latest_chapter_time: "Archived",
    tags: ["Cultivation", "Classic"],
  },
];

export default function HomePage() {
  const [activeGenre, setActiveGenre] = useState("all");
  const [activeStatus, setActiveStatus] = useState("Any");
  const [activeSort, setActiveSort] = useState("Most Popular (Monthly Activity)");
  const [activeScope, setActiveScope] = useState("All Lengths");
  const [activeFrequency, setActiveFrequency] = useState("All Release Rhythms");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1);

  const handleResetFilters = () => {
    setActiveGenre("all");
    setActiveStatus("Any");
    setActiveSort("Most Popular (Monthly Activity)");
    setActiveScope("All Lengths");
    setActiveFrequency("All Release Rhythms");
  };

  return (
    <div className="w-full flex flex-col space-y-8">
      {/* 1. Editorial Spotlight / Featured Serial Hero */}
      <HeroSpotlight />

      {/* 2. Discovery Canvas & Multi-facet Filter System */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
        <FilterBar
          activeGenre={activeGenre}
          onSelectGenre={setActiveGenre}
          activeStatus={activeStatus}
          onSelectStatus={setActiveStatus}
          activeSort={activeSort}
          onSelectSort={setActiveSort}
          activeScope={activeScope}
          onSelectScope={setActiveScope}
          activeFrequency={activeFrequency}
          onSelectFrequency={setActiveFrequency}
          onResetFilters={handleResetFilters}
          totalNovels={1420}
          displayRange="1 - 8"
        />

        {/* 3. Main Content Area: Asymmetric 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= LEFT: Catalog Grid (8 Columns) ================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* Catalog Subheader */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-text-main">
                  Curated Serial Works
                </h2>
                <span className="text-xs bg-tag text-text-muted px-2 py-0.5 rounded border border-border-subtle font-medium">
                  Catalog Feed
                </span>
              </div>

              {/* View Switcher (Grid / List) */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-tag text-text-main shadow-2xs"
                      : "text-text-muted hover:text-text-main hover:bg-tag"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-tag text-text-main shadow-2xs"
                      : "text-text-muted hover:text-text-main hover:bg-tag"
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2-Column Catalog Cards Layout */}
            <div
              className={`grid gap-5 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1"
              }`}
            >
              {STITCH_CATALOG.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* Catalog Pagination Bar */}
            <CatalogPagination
              currentPage={currentPage}
              totalPages={124}
              onPageChange={setCurrentPage}
            />
          </div>

          {/* ================= RIGHT: Sidebar Widgets (4 Columns) ================= */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Widget 1: Real-Time Power Rankings (Top 10) */}
            <RankingsSidebar />

            {/* Widget 2: Live Serial Pulse */}
            <LiveSerialPulse />

            {/* Widget 3: Trending Motifs */}
            <TrendingMotifs />

            {/* Widget 4: Reader Engagement / Weekly Reading Goal */}
            <ReadingGoalWidget />
          </aside>
        </div>
      </div>
    </div>
  );
}
