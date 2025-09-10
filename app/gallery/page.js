 'use client'
 import { useState } from 'react'
    import Image from 'next/image'
    import Header from '../../components/Header'
    import Footer from '../../components/Footer'

    export default function Gallery() {
        const [images, setImages] = useState([]);

        return (
            <>
                <Header />
                <main>
                    <h1>Gallery</h1>
                    <div className="gallery">
                        {images.map((image) => (
                            <div key={image.id} className="gallery-item">
                                <Image src={image.src} alt={image.alt} width={300} height={300} />
                            </div>
                        ))}
                    </div>
                </main>
                <Footer />
            </>
        );
    }