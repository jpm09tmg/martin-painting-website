 'use client'
 import { useState } from 'react'
    import Image from 'next/image'
    import Header from '../../components/Header'
    import Footer from '../../components/Footer'

    export default function Gallery() {
        //const [images, setImages] = useState([]);

        const [activeFilter, setActiveFilter] = useState('all');

        const projects = [
            { 
                id: 1,
                category: ['exterior', 'residential'],
                image: '/blueExt.jpg',
                alt: 'Blue Exterior'
            },
            { 
                id: 2,
                category: ['interior', 'residential'],
                image: '/blueLiving.jpg',
                alt: 'Blue Living Room'
            },
            { 
                id: 3,
                category: ['interior', 'commercial'],
                image: '/blueOffice.jpg',
                alt: 'Blue Office'
            },
            { 
                id: 4,
                category: ['exterior', 'residential'],
                image: '/deckstain.jpg',
                alt: 'Deck Stain'
            },
            { 
                id: 5,
                category: ['interior', 'residential'],
                image: 'greenBed.jpg',
                alt: 'Green Bedroom'
            },
            { 
                id: 6,
                category: ['interior', 'residential'],
                image: 'greyBath.jpg',
                alt: 'Grey Bathroom'
            },
            { 
                id: 7,
                category: ['interior', 'commercial'],
                image: 'greyCom.jpg',
                alt: 'Grey Commercial Hallway'
            },
            { 
                id: 8,
                category: ['interior', 'commercial'],
                image: 'greyLiving.jpg',
                alt: 'Grey Living Room'
            },
            { 
                id: 9,  
                category: ['interior', 'commercial'],
                image: 'greyShop.jpg',
                alt: 'Grey Shop'
            },
            { 
                id: 10,
                category: ['exterior', 'residential'],
                image: 'redExt.jpg',
                alt: 'Red Exterior'
            },
            { 
                id: 11,
                category: ['interior', 'residential'],
                image: 'whiteBath.jpg',
                alt: 'White Bathroom'
            },
            { 
                id: 12,
                category: ['interior', 'residential'],
                image: 'whiteKitchen.jpg',
                alt: 'White Kitchen'
            },
            { 
                id: 13,
                category: ['interior', 'residential'],
                image: 'whiteLiving.jpg',
                alt: 'White Living Room'
            },
            { 
                id: 14,
                category: ['interior', 'commercial'],
                image: 'whiteOffice.jpg',
                alt: 'White Office'
            },
            { 
                id: 15,
                category: ['exterior', 'residential'],
                image: 'whiteRedExt.jpg',
                alt: 'White and Red Exterior'
            }
        ]


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