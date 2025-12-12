export default function daysUntilWedding() {
  const weddingDate = new Date('2026-10-10T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = weddingDate - today;
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
