import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { NewsCard, NewsCover, NewsMeta } from "@/app/news/news-card";
import { getNews, getNewsArticle } from "@/lib/api/news";

// Static, re-rendered at most every 5 minutes; articles added later render on first visit.
export const revalidate = 300;

// The name is fixed by Next.js.
// eslint-disable-next-line unicorn/prevent-abbreviations
export async function generateStaticParams() {
  const news = await getNews();
  return news.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata(
  props: PageProps<"/news/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const article = await getNewsArticle(slug);
  if (article == null) {
    return { title: "Aktualności" };
  }
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph:
      article.image == null
        ? undefined
        : { images: [`${article.image.src}?width=1200&format=jpg`] },
  };
}

export default async function NewsArticlePage(
  props: PageProps<"/news/[slug]">,
) {
  const { slug } = await props.params;
  const [article, news] = await Promise.all([getNewsArticle(slug), getNews()]);
  if (article == null) {
    notFound();
  }
  const more = news.filter((item) => item.slug !== article.slug).slice(0, 2);
  const lead = article.blocks.at(0);
  const rest = article.blocks.slice(1);
  // Without a body the excerpt stands in as the lead paragraph.
  const leadText =
    lead == null
      ? article.excerpt
      : lead.type === "paragraph"
        ? lead.text
        : null;

  return (
    <article className="px-4 pt-10 pb-24 sm:px-6 lg:pt-14 lg:pb-32">
      <Link
        href="/news"
        className="text-muted-foreground hover:text-foreground group inline-flex items-center gap-2 text-sm font-medium transition-colors"
      >
        <ArrowLeftIcon
          aria-hidden
          weight="bold"
          className="size-4 transition-transform group-hover:-translate-x-1"
        />
        Aktualności
      </Link>

      <header className="motion-safe:animate-fade-up mt-10 max-w-4xl">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <NewsMeta item={article} />
          <span className="text-muted-foreground text-sm">
            {`${String(article.readingMinutes)}\u00A0min czytania`}
          </span>
        </div>
        <h1 className="text-foreground mt-5 text-4xl leading-[1.05] font-bold tracking-tighter text-balance sm:text-5xl lg:text-7xl">
          {article.title}
        </h1>
      </header>

      {article.image == null ? null : (
        <NewsCover
          item={article}
          priority
          sizes="(min-width: 1280px) 1232px, 100vw"
          className="motion-safe:animate-clip-reveal mt-12 aspect-[16/9] lg:aspect-[21/9]"
        />
      )}

      <div className="mt-14 grid grid-cols-1 lg:mt-20 lg:grid-cols-12">
        <div className="lg:col-span-8 lg:col-start-3">
          {lead?.type === "heading" ? (
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              {lead.text}
            </h2>
          ) : null}
          {leadText == null ? null : (
            <p className="text-foreground text-xl leading-relaxed sm:text-2xl">
              {leadText}
            </p>
          )}
          {rest.map((block, index) =>
            block.type === "heading" ? (
              <h2
                key={`${String(index)}-${block.text}`}
                className="text-foreground mt-14 text-2xl font-bold tracking-tight text-balance sm:text-3xl"
              >
                {block.text}
              </h2>
            ) : (
              <p
                key={`${String(index)}-${block.text.slice(0, 24)}`}
                className="text-foreground/80 mt-6 text-base leading-[1.8] sm:text-lg"
              >
                {block.text}
              </p>
            ),
          )}
        </div>
      </div>

      {more.length === 0 ? null : (
        <section
          aria-labelledby="czytaj-dalej"
          className="border-border mt-24 border-t pt-12 lg:mt-32"
        >
          <h2
            id="czytaj-dalej"
            className="text-foreground text-3xl font-bold tracking-tighter sm:text-4xl"
          >
            Czytaj dalej
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2">
            {more.map((item) => (
              <NewsCard key={item.slug} item={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
