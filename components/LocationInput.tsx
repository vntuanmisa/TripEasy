import React from 'react';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({ value, onChange, placeholder }) => {
  // TODO: Integrate Google Maps Places API here.
  // 1. Add the Google Maps script to index.html.
  // 2. Initialize the Autocomplete service on this input field.
  // 3. Use a ref for the input element.
  // 4. On place_changed event, call onChange with the selected place name/address.

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="shadow-inner appearance-none border rounded-lg w-full py-3 px-4 text-dark leading-tight focus:outline-none focus:ring-2 focus:ring-primary pl-10"
      />
      <i className="fa-solid fa-map-marker-alt absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
      <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-blue-700" title="Select on map (feature coming soon)">
        <i className="fa-solid fa-map"></i>
      </button>
    </div>
  );
};

export default LocationInput;
