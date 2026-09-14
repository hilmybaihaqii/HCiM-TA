import { notFound, redirect } from 'next/navigation';
import { ARTICLES_DATA } from '@/data/articlesData';

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const article = ARTICLES_DATA.find((item) => item.slug === slug);

  if (!article) {
    notFound();
  }

  redirect(`https://doi.org/${article.doi}`);
}
