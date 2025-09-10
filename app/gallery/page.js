 'use client'
 import { useState } from 'react'
    import Image from 'next/image'
    import Header from '../components/Header'
    import Footer from '../components/Footer'

    export default function Gallery() {
        //const [images, setImages] = useState([]);

        //sets default filter to 'all'
        const [activeFilter, setActiveFilter] = useState('all');


        //image data
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
                image: '/greenBed.jpg',
                alt: 'Green Bedroom'
            },
            { 
                id: 6,
                category: ['interior', 'residential'],
                image: '/greyBath.jpg',
                alt: 'Grey Bathroom'
            },
            { 
                id: 7,
                category: ['interior', 'commercial'],
                image: '/greyCom.jpg',
                alt: 'Grey Commercial Hallway'
            },
            { 
                id: 8,
                category: ['interior', 'commercial'],
                image: '/greyLiving.jpg',
                alt: 'Grey Living Room'
            },
            { 
                id: 9,  
                category: ['interior', 'commercial'],
                image: '/greyShop.jpg',
                alt: 'Grey Shop'
            },
            { 
                id: 10,
                category: ['exterior', 'residential'],
                image: '/redExt.jpg',
                alt: 'Red Exterior'
            },
            { 
                id: 11,
                category: ['interior', 'residential'],
                image: '/whiteBath.jpg',
                alt: 'White Bathroom'
            },
            { 
                id: 12,
                category: ['interior', 'residential'],
                image: '/whiteKitchen.jpg',
                alt: 'White Kitchen'
            },
            { 
                id: 13,
                category: ['interior', 'residential'],
                image: '/whiteLiving.jpg',
                alt: 'White Living Room'
            },
            { 
                id: 14,
                category: ['interior', 'commercial'],
                image: '/whiteOffice.jpg',
                alt: 'White Office'
            },
            { 
                id: 15,
                category: ['exterior', 'residential'],
                image: '/whiteRedExt.jpg',
                alt: 'White and Red Exterior'
            }
        ]

        // Sets filtering based on category by navigating the category buttons at top of gallery
        const filteredProjects = activeFilter === 'all'
            ? projects
            : projects.filter(project => project.category.includes(activeFilter)) // changed to accommodate change from single tag to array of tags


        // Note: Consider adding a file that determines website color scheme and company theme to allow easy switching of color palette
        return (
            <div className="w-full min-h-screen flex flex-col bg-white">
                <Header currentPage="gallery" />
                                
                <div className="bg[#F1F4E8] py-16">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Painting Project Gallery</h1>
                        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                            Explore some of our completed painting projects. From interior walls to full home exteriors and commercial spaces, we bring color and quality craftsmanship to every job.
                        </p>
                    </div>
                </div>
                
                
                {/* Filter Buttons */}
                <div className="py-8 bg-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex justify-center space-x-4">
                            {['all', 'interior', 'exterior', 'commercial', 'residential'].map((cat) => (
                            <button
                                key={cat} // switched filter buttons to loop instead of hardcoding each button for better rendering
                                onClick={() => setActiveFilter(cat)}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                activeFilter === cat
                                    ? 'bg-[#5F9136] text-white'
                                    : 'bg-white text-gray-700 border border-[#5F9136] hover:bg-[#5F9136] hover:text-white'
                                }`}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)} {/* Capitalizes first letter of each filter button */}
                            </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/*Project Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map(project => (
                        <div key={project.id} className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                                <Image
                                    src={project.image}
                                    alt={project.alt}
                                    width={400}
                                    height={300}
                                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}

            </div>

        )
    }