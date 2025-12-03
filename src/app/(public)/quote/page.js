"use client";
import { useState } from "react";
import Link from "next/link";
import Header from "@/src/components/layout/Header";
import Footer from "@/src/components/layout/Footer";

export default function QuotePage() {
  const [formData, setFormData] = useState({
    propertyType: "",
    locationType: "",
    squareFootage: "",
    numberOfRooms: "",
    ceilingHeight: "",
    currentCondition: "",
    paintQuality: "",
  });

  const [estimate, setEstimate] = useState(null);

  // property type, job type, paint condition, etc options. Multipliers added to the end(might have to adjust)
  // we could add these to database later for easier updating
  // Base rates are per square foot
  // Multipliers increase the base rate by a percentage
  const propertyTypes = [
    {
      name: "Residential",
      description: "Homes, condos, townhouses",
      multiplier: 1.0,
    },
    {
      name: "Commercial",
      description: "Offices, retail, restaurants",
      multiplier: 1.1,
    },
  ];

  const locationTypes = [
    {
      name: "Interior",
      description: "Indoor painting projects",
      baseRate: 3.0,
    },
    {
      name: "Exterior",
      description: "Outdoor painting projects",
      baseRate: 3.5,
    },
  ];

  const paintConditions = [
    { name: "Excellent", description: "Recently painted", multiplier: 1.0 },
    { name: "Good", description: "Minor touch-ups needed", multiplier: 1.05 },
    { name: "Fair", description: "Some prep work required", multiplier: 1.1 },
    {
      name: "Poor",
      description: "Extensive prep work needed",
      multiplier: 1.15,
    },
  ];

  const paintQualities = [
    { name: "Standard", description: "Good quality paint", multiplier: 1.0 },
    { name: "Premium", description: "High-end paint", multiplier: 1.05 },
    { name: "Luxury", description: "Top-of-the-line paint", multiplier: 1.15 },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateEstimate = () => {
    const sqft = parseInt(formData.squareFootage) || 0;
    const rooms = parseInt(formData.numberOfRooms) || 1;

    if (sqft === 0 || !formData.locationType) {
      alert("Please fill in at least the square footage and location type");
      return;
    }

    // this is the base calculation
    const locationType = locationTypes.find(
      (type) => type.name === formData.locationType
    );
    let baseRate = locationType?.baseRate || 3.0;

    // multipliers are applied based on selections

    const propertyMultiplier =
      propertyTypes.find((type) => type.name === formData.propertyType)
        ?.multiplier || 1.0;
    const conditionMultiplier =
      paintConditions.find(
        (condition) => condition.name === formData.currentCondition
      )?.multiplier || 1.2;
    const qualityMultiplier =
      paintQualities.find((quality) => quality.name === formData.paintQuality)
        ?.multiplier || 1.0;

    // ceiling height adjustments
    let ceilingMultiplier = 1.0;
    if (formData.ceilingHeight === "9ft") ceilingMultiplier = 1.05;
    if (formData.ceilingHeight === "10ft") ceilingMultiplier = 1.1;
    if (formData.ceilingHeight === "10ft+") ceilingMultiplier = 1.15;

    // calculate base cost
    let totalCost =
      sqft *
      baseRate *
      propertyMultiplier *
      conditionMultiplier *
      qualityMultiplier *
      ceilingMultiplier;

    // calculation for multiple rooms. price slightly increases with each additional room. (work in progress)
    if (rooms > 1) {
      totalCost *= 1 + (rooms - 1) * 0.05;
    }

    setEstimate({
      baseRate,
      totalCost: Math.round(totalCost),
      costPerSqft: Math.round((totalCost / sqft) * 100) / 100,
      breakdown: {
        propertyMultiplier,
        conditionMultiplier,
        qualityMultiplier,
        ceilingMultiplier,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background-dark text-text pt-16">
      <Header currentPage="quote" />

      {/* Hero Section */}
      <div className="bg-background-dark py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-text mb-4">
            Get Your Painting Estimate
          </h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Fill out the details below to receive a personalized estimate for
            your painting project
          </p>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto pb-48 px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-background rounded-lg shadow-lg border border-border-muted">
              {/* Project Type Section */}
              <div className="p-6 border-b border-border-muted">
                <h2 className="text-xl font-semibold text-text mb-6">
                  Project Type
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Property Type */}
                  <div>
                    <h3 className="text-sm font-medium text-text mb-4">
                      Property Type
                    </h3>
                    <div className="space-y-3">
                      {propertyTypes.map((property) => (
                        <label
                          key={property.name}
                          className="flex items-start space-x-3 p-4 bg-background-light border border-border-muted rounded-lg cursor-pointer transition-colors hover:border-border"
                        >
                          <input
                            type="radio"
                            name="propertyType"
                            value={property.name}
                            checked={formData.propertyType === property.name}
                            onChange={handleInputChange}
                            className="mt-1 w-4 h-4 text-text border-border-muted focus:ring-background focus:ring-offset-background      "
                          />
                          <div>
                            <div className="font-medium text-text">
                              {property.name}
                            </div>
                            <div className="text-sm text-text-muted">
                              {property.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Location Type */}
                  <div>
                    <h3 className="text-sm font-medium text-text mb-4">
                      Location Type *
                    </h3>
                    <div className="space-y-3">
                      {locationTypes.map((location) => (
                        <label
                          key={location.name}
                          className="flex items-start space-x-3 p-4 bg-background-light border border-border-muted rounded-lg cursor-pointer transition-colors hover:border-border"
                        >
                          <input
                            type="radio"
                            name="locationType"
                            value={location.name}
                            checked={formData.locationType === location.name}
                            onChange={handleInputChange}
                            className="mt-1 w-4 h-4 text-text border-border-muted focus:ring-background focus:ring-offset-background      "
                          />
                          <div>
                            <div className="font-medium text-text">
                              {location.name}
                            </div>
                            <div className="text-sm text-text-muted">
                              {location.description}
                            </div>
                            <div className="text-xs text-primary font-medium">
                              ${location.baseRate}/sq ft base
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Details Section */}
              <div className="p-6 border-b border-border-muted">
                <h2 className="text-xl font-semibold text-text mb-6">
                  Project Details
                </h2>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Square Footage * (approximate)
                    </label>
                    <input
                      type="number"
                      name="squareFootage"
                      value={formData.squareFootage}
                      onChange={handleInputChange}
                      placeholder="e.g., 1200"
                      min="0"
                      className="w-full px-3 py-2 border border-border-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Number of Rooms/Areas
                    </label>
                    <input
                      type="number"
                      name="numberOfRooms"
                      value={formData.numberOfRooms}
                      onChange={handleInputChange}
                      placeholder="e.g., 3"
                      min="1"
                      className="w-full px-3 py-2 border border-border-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Ceiling Height
                    </label>
                    <select
                      name="ceilingHeight"
                      value={formData.ceilingHeight}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                    >
                      <option className="bg-background-light" value="">
                        Select height
                      </option>
                      <option className="bg-background-light" value="8ft">
                        8 feet (standard)
                      </option>
                      <option className="bg-background-light" value="9ft">
                        9 feet (+5%)
                      </option>
                      <option className="bg-background-light" value="10ft">
                        10 feet (+10%)
                      </option>
                      <option className="bg-background-light" value="10ft+">
                        10+ feet (+15%)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Current Paint Condition
                    </label>
                    <select
                      name="currentCondition"
                      value={formData.currentCondition}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                    >
                      <option className="bg-background-light" value="">
                        Select condition
                      </option>
                      {paintConditions.map((condition) => (
                        <option
                          className="bg-background-light"
                          key={condition.name}
                          value={condition.name}
                        >
                          {condition.name} - {condition.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Paint Quality Preference
                    </label>
                    <select
                      name="paintQuality"
                      value={formData.paintQuality}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-border-muted rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text"
                    >
                      <option className="bg-background-light" value="">
                        Select quality
                      </option>
                      {paintQualities.map((quality) => (
                        <option
                          className="bg-background-light"
                          key={quality.name}
                          value={quality.name}
                        >
                          {quality.name} - {quality.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Section */}
              <div className="p-6">
                <button
                  type="button"
                  onClick={calculateEstimate}
                  className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-md hover:bg-background-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-300"
                >
                  Calculate Estimate
                </button>
              </div>
            </div>
          </div>

          {/* Estimate Results */}
          <div className="lg:col-span-1">
            <div className="bg-background-light rounded-lg shadow-lg border border-border-muted sticky top-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-text mb-4">
                  Your Estimate
                </h2>

                {/* displays estimate results if requested and a button to book an appointment. 
                tells user to fill out form if not */}
                {estimate ? (
                  <div>
                    <div className="bg-primary/10 rounded-lg p-4 mb-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">
                          ${estimate.totalCost.toLocaleString()}
                        </div>
                        <div className="text-sm text-text">
                          ${estimate.costPerSqft}/sq ft
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span>Base rate:</span>
                        <span>${estimate.baseRate}/sq ft</span>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="text-xs text-text mb-2">
                          Applied adjustments:
                        </div>
                        {estimate.breakdown.propertyMultiplier !== 1.0 && (
                          <div className="flex justify-between text-xs">
                            <span>Property type:</span>
                            <span>
                              {Math.round(
                                (estimate.breakdown.propertyMultiplier - 1) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        )}
                        {estimate.breakdown.conditionMultiplier !== 1.0 && (
                          <div className="flex justify-between text-xs">
                            <span>Paint condition:</span>
                            <span>
                              {Math.round(
                                (estimate.breakdown.conditionMultiplier - 1) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        )}
                        {estimate.breakdown.qualityMultiplier !== 1.0 && (
                          <div className="flex justify-between text-xs">
                            <span>Paint quality:</span>
                            <span>
                              {Math.round(
                                (estimate.breakdown.qualityMultiplier - 1) * 100
                              )}
                              %
                            </span>
                          </div>
                        )}
                        {estimate.breakdown.ceilingMultiplier !== 1.0 && (
                          <div className="flex justify-between text-xs">
                            <span>Ceiling height:</span>
                            <span>
                              {Math.round(
                                (estimate.breakdown.ceilingMultiplier - 1) * 100
                              )}
                              %
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Links to appointment page */}
                    <div className="mt-6 pt-4 border-t">
                      <Link
                        href="/appointments"
                        className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-md hover:bg-background-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-300"
                      >
                        Book Consultation
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-text-muted text-center py-8">
                    <p>Fill out the form to get your estimate</p>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="mt-6 p-3 bg-background-light border border-border-muted rounded-lg">
                  <div className="text-xs text-primary">
                    <strong>Note:</strong> This is a preliminary estimate only.
                    Final pricing may vary based on site conditions and specific
                    requirements.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
