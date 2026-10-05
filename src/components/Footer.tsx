import Link from "next/link";
import { IconMail, IconPhone, IconPin } from "@/components/Icons";
import { LogoMark } from "@/components/Logo";
import { shop } from "@/data/shop";
import { pageShell } from "@/components/ui";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-shell">
      <div className={`${pageShell} grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4`}>
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <LogoMark size={30} />
            <span className="font-display text-lg">Rasa Bonaire</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted">
            A preorder kitchen on Kaya Grandi. You order in the morning, we cook in the afternoon,
            you collect inside your slot. Two menus, one island.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-ink-soft">
            <li className="flex items-center gap-2">
              <IconPin size={16} className="text-accent" />
              {shop.street}, {shop.city}
            </li>
            <li className="flex items-center gap-2">
              <IconPhone size={16} className="text-accent" />
              <a href={`tel:${shop.phone.replace(/\s/g, "")}`} className="hover:text-ink">
                {shop.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <IconMail size={16} className="text-accent" />
              <a href={`mailto:${shop.emailOrders}`} className="hover:text-ink">
                {shop.emailOrders}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Order</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/menu" className="hover:text-accent">
                Full menu
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-accent">
                Cart
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-accent">
                Track a preorder
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-accent">
                Sign in
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Kitchen hours
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
            {shop.openingHours.map((row) => (
              <li key={row.days} className="flex flex-col">
                <span className="font-medium text-ink">{row.days}</span>
                <span className="text-muted">{row.hours}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div
          className={`${pageShell} flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between`}
        >
          <p>
            © {new Date().getFullYear()} Rasa Bonaire · Kralendijk, Caribbean Netherlands · Demo
            store, no money is moved.
          </p>
          <p>Prices in USD, included in the receipt the same way we print it at the counter.</p>
        </div>
      </div>
    </footer>
  );
}
