import Link from 'next/link'
import Image from 'next/image'

export default function AdminHeader() {
    return (
        <div className="w-full h-16 bg-[#74A744] justify-center flex items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="w-28 h-12 bg-[#E4EDCB] rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/martinPainting.png"
                  alt="Martin Painting Logo"
                  width={144}
                  height={69}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
        </div>
    )
}