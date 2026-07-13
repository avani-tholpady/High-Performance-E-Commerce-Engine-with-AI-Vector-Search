interface ProductCardProps {
  name: string;
  category: string;
  price: number;
  image: string;
}

function ProductCard({ name, category, price, image }: ProductCardProps) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        width: "220px",
        textAlign: "center",
      }}
    >
      <img src={image} alt={name} width={150} height={150} />
      <h3>{name}</h3>
      <p>{category}</p>
      <h4>₹{price}</h4>
    </div>
  );
}

export default ProductCard;