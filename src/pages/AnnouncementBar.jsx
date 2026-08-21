import { Link } from "react-router-dom";

export default function AnnouncementBar() {
  const title = 'Explore our new Heritage Collection. '

  return (
    <div className="bg-deep-emerald text-surface-white text-center py-2.5 px-4 font-body-md text-xs md:text-sm tracking-wide">
      <span className="hidden md:inline">Complimentary shipping on orders above ₹5,000 ·</span>
      <span className="md:ml-2">{title}</span>
      <Link className="underline" to="/shop">
   Shop Now
</Link>
    </div>
  )
}
