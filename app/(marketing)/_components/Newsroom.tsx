import Image from 'next/image';
import dawn from '../_assets/news-mesa-dawn.jpg';
import day from '../_assets/news-mesa-day.jpg';
import dusk from '../_assets/news-mesa-dusk.jpg';
import sunset from '../_assets/news-mesa-sunset.jpg';

const STORIES = [
  {
    title: 'Introducing Scenario Builder',
    category: 'Product',
    date: 'Jan 12, 2025',
    image: sunset,
  },
  {
    title: 'How teams close readiness gaps',
    category: 'Guide',
    date: 'Dec 3, 2024',
    image: day,
  },
  {
    title: 'Ransomware tabletop playbook',
    category: 'Use Case',
    date: 'Nov 18, 2024',
    image: dusk,
  },
  {
    title: 'Measuring decision quality at scale',
    category: 'Product',
    date: 'Oct 29, 2024',
    image: dawn,
  },
];

export function Newsroom() {
  return (
    <section className="ms-news" id="news">
      <div className="ms-container ms-news-layout">
        <div className="ms-news-intro">
          <span className="ms-eyebrow">Newsroom</span>
          <h2>The latest from MESA</h2>
          <p>Product updates, playbooks, and stories from teams building readiness into the work.</p>
          <a className="ms-link" href="#news">
            View all news <span aria-hidden>→</span>
          </a>
        </div>
        <div className="ms-news-grid">
          {STORIES.map((story) => (
            <article className="ms-news-card" key={story.title}>
              <Image src={story.image} alt="" width={480} height={300} />
              <div className="ms-news-card-body">
                <h3>{story.title}</h3>
                <div className="ms-news-meta">
                  <span>{story.category}</span>
                  <span aria-hidden>·</span>
                  <span>{story.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
