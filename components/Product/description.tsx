interface DescriptionProps {
  paragraphs: string[];
}

export function Description({ paragraphs }: DescriptionProps) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Description</h2>
      <div className="space-y-4 text-muted-foreground">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
