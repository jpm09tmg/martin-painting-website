import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <div className="w-full bg-background py-16">
      <div className="max-w-7xl mx-auto px-20">
        <div className="grid grid-cols-4 gap-12 mb-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-16  rounded-lg overflow-hidden mb-4">
              <Image
                src="/martinPainting_v2.png"
                alt="Martin Painting Logo"
                width={144}
                height={69}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-text-muted text-lg font-semibold mb-2">
              Martin Painting
            </h3>
            <p className="text-text-muted/90 text-sm leading-relaxed">
              Professional painting services for residential and commercial
              properties in Calgary.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <h3 className="text-text-muted text-lg font-semibold mb-4">
              Our Services
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/services#interior" className="text-text-muted/90 text-sm hover:text-text-muted transition-colors cursor-pointer">
                  Interior Painting
                </Link>
              </li>
              <li>
                <Link href="/services#exterior" className="text-text-muted/90 text-sm hover:text-text-muted transition-colors cursor-pointer">
                  Exterior Painting
                </Link>
              </li>
              <li>
                <Link href="/services#residential" className="text-text-muted/90 text-sm hover:text-text-muted transition-colors cursor-pointer">
                  Residential Services
                </Link>
              </li>
              <li>
                <Link href="/services#commercial" className="text-text-muted/90 text-sm hover:text-text-muted transition-colors cursor-pointer">
                  Commercial Services
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center text-center">
            <h3 className="text-text-muted text-lg font-semibold mb-4">
              Contact Info
            </h3>
            <ul className="space-y-3">
              <li className="flex flex-col items-center">
                <span className="text-text-muted/70 text-xs uppercase tracking-wide mb-1">
                  Phone
                </span>
                <span className="text-text-muted/90 text-sm">
                  (403) 555-PAINT
                </span>
              </li>
              <li className="flex flex-col items-center">
                <span className="text-text-muted/70 text-xs uppercase tracking-wide mb-1">
                  Email
                </span>
                <span className="text-text-muted/90 text-sm">
                  info@martinpainting.ca
                </span>
              </li>
              <li className="flex flex-col items-center">
                <span className="text-text-muted/70 text-xs uppercase tracking-wide mb-1">
                  Location
                </span>
                <span className="text-text-muted/90 text-sm">
                  Calgary, Alberta
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center text-center">
            <h3 className="text-text-muted text-lg font-semibold mb-4">
              Follow Us
            </h3>
            <div className="flex space-x-4 mb-4">
              <div className="w-8 h-8 bg-background-light hover:bg-white/10 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                <span className="text-white text-sm">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.4375 8.71875C17.4375 3.90234 13.5352 0 8.71875 0C3.90234 0 0 3.90234 0 8.71875C0 13.0704 3.18832 16.6774 7.35645 17.332V11.2391H5.1416V8.71875H7.35645V6.79781C7.35645 4.61285 8.65723 3.40594 10.6495 3.40594C11.6037 3.40594 12.6014 3.57609 12.6014 3.57609V5.72062H11.5017C10.4189 5.72062 10.0811 6.39281 10.0811 7.08223V8.71875H12.4991L12.1124 11.2391H10.0811V17.332C14.2492 16.6774 17.4375 13.0704 17.4375 8.71875Z"
                      fill="lightblue"
                    />
                  </svg>
                </span>
              </div>
              <div className="w-8 h-8 bg-background-light hover:bg-white/10 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                <span className="text-white text-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.87847 3.83818C5.64253 3.83818 3.83901 5.6417 3.83901 7.87764C3.83901 10.1136 5.64253 11.9171 7.87847 11.9171C10.1144 11.9171 11.9179 10.1136 11.9179 7.87764C11.9179 5.6417 10.1144 3.83818 7.87847 3.83818ZM7.87847 10.5038C6.43355 10.5038 5.25229 9.32607 5.25229 7.87764C5.25229 6.4292 6.43003 5.25146 7.87847 5.25146C9.3269 5.25146 10.5046 6.4292 10.5046 7.87764C10.5046 9.32607 9.32339 10.5038 7.87847 10.5038ZM13.0253 3.67295C13.0253 4.19678 12.6035 4.61514 12.0832 4.61514C11.5593 4.61514 11.141 4.19326 11.141 3.67295C11.141 3.15264 11.5628 2.73076 12.0832 2.73076C12.6035 2.73076 13.0253 3.15264 13.0253 3.67295ZM15.7007 4.6292C15.641 3.36709 15.3527 2.24912 14.4281 1.32803C13.507 0.406933 12.389 0.118652 11.1269 0.0553711C9.82612 -0.018457 5.9273 -0.018457 4.62651 0.0553711C3.36792 0.115137 2.24995 0.403418 1.32534 1.32451C0.400733 2.24561 0.115967 3.36357 0.0526855 4.62568C-0.0211426 5.92646 -0.0211426 9.82529 0.0526855 11.1261C0.112451 12.3882 0.400733 13.5062 1.32534 14.4272C2.24995 15.3483 3.3644 15.6366 4.62651 15.6999C5.9273 15.7737 9.82612 15.7737 11.1269 15.6999C12.389 15.6401 13.507 15.3519 14.4281 14.4272C15.3492 13.5062 15.6375 12.3882 15.7007 11.1261C15.7746 9.82529 15.7746 5.92998 15.7007 4.6292ZM14.0203 12.5218C13.746 13.2108 13.2152 13.7417 12.5226 14.0194C11.4855 14.4308 9.02456 14.3358 7.87847 14.3358C6.73237 14.3358 4.26792 14.4272 3.23433 14.0194C2.54526 13.7452 2.0144 13.2144 1.73667 12.5218C1.32534 11.4847 1.42026 9.02373 1.42026 7.87764C1.42026 6.73154 1.32886 4.26709 1.73667 3.2335C2.01089 2.54443 2.54175 2.01357 3.23433 1.73584C4.27144 1.32451 6.73237 1.41943 7.87847 1.41943C9.02456 1.41943 11.489 1.32803 12.5226 1.73584C13.2117 2.01006 13.7425 2.54092 14.0203 3.2335C14.4316 4.27061 14.3367 6.73154 14.3367 7.87764C14.3367 9.02373 14.4316 11.4882 14.0203 12.5218Z"
                      fill="lightblue"
                    />
                  </svg>
                </span>
              </div>
              <div className="w-8 h-8 bg-background-light hover:bg-white/10 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                <span className="text-text-muted text-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.625 0H1.12148C0.502734 0 0 0.509766 0 1.13555V14.6145C0 15.2402 0.502734 15.75 1.12148 15.75H14.625C15.2437 15.75 15.75 15.2402 15.75 14.6145V1.13555C15.75 0.509766 15.2437 0 14.625 0ZM4.76016 13.5H2.42578V5.98359H4.76367V13.5H4.76016ZM3.59297 4.95703C2.84414 4.95703 2.23945 4.34883 2.23945 3.60352C2.23945 2.8582 2.84414 2.25 3.59297 2.25C4.33828 2.25 4.94648 2.8582 4.94648 3.60352C4.94648 4.35234 4.3418 4.95703 3.59297 4.95703ZM13.5105 13.5H11.1762V9.84375C11.1762 8.97188 11.1586 7.85039 9.96328 7.85039C8.74687 7.85039 8.56055 8.79961 8.56055 9.78047V13.5H6.22617V5.98359H8.46562V7.01016H8.49727C8.81016 6.41953 9.57305 5.79727 10.7086 5.79727C13.0711 5.79727 13.5105 7.35469 13.5105 9.37969V13.5Z"
                      fill="lightblue"
                    />
                  </svg>
                </span>
              </div>
            </div>
            <p className="text-text-muted/90 text-sm">
              Stay updated with our latest painting projects
            </p>
          </div>
        </div>

        <div className="border-t border-background-light pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-text-muted/90 text-sm">
              © 2025 Martin Painting. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <span className="text-text-muted/70 text-sm hover:text-text-muted cursor-pointer transition-colors">
                Privacy Policy
              </span>
              <span className="text-text-muted/70 text-sm hover:text-text-muted cursor-pointer transition-colors">
                Terms of Service
              </span>
              <span className="text-text-muted/70 text-sm hover:text-text-muted cursor-pointer transition-colors">
                Site Map
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
