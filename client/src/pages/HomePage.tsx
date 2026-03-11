import { ChangeEvent, FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import "../css/HomePage.css";

export interface SearchFormData {
  city: string;
  minPrice: number | "";
  maxPrice: number | "";
  beds: string;
  baths: string;
}

interface SearchFormProps {
  onSearch: (data: SearchFormData) => void;
}

export const SearchForm = ({ onSearch }: SearchFormProps) => {
  const [formData, setFormData] = useState<SearchFormData>({
    city: "",
    minPrice: "",
    maxPrice: "",
    beds: "",
    baths: "",
  });

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    const fieldName = name as keyof SearchFormData;

    let nextValue: SearchFormData[keyof SearchFormData];
    if (fieldName === "minPrice" || fieldName === "maxPrice") {
      nextValue = value === "" ? "" : Number(value);
    } else {
      nextValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [fieldName]: nextValue,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(formData);
  };

  return (
    <div className="hero">
      <div className="hero-content">
        <h1 className="hero-title">DEAL LANDERS ARIZONA REALTY</h1>
        <div className="form-box">
          <div className="buy-or-sell">
            <h2 className="buy-a-home">Buy a Home</h2>
            <Link
              to="/lets-connect"
              className="sell-a-home"
            >
              Sell a Home
            </Link>
          </div>
          <div className="form-container">
            <form
              onSubmit={handleSubmit}
              className="search-form"
            >
              <input
                type="text"
                className="search-city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="City"
              />
              <input
                type="number"
                className="search-min-price"
                name="minPrice"
                value={formData.minPrice}
                onChange={handleChange}
                min={0}
                placeholder="Min Price"
                required
              />
              <input
                type="number"
                className="search-max-price"
                name="maxPrice"
                value={formData.maxPrice}
                onChange={handleChange}
                min={0}
                placeholder="Max Price"
                required
              />
              <select
                name="beds"
                className="search-beds"
                value={formData.beds}
                onChange={handleChange}
                required
              >
                <option
                  value=""
                  disabled
                >
                  Beds
                </option>
                <option value="any">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
                <option value="6">6+</option>
              </select>
              <select
                name="baths"
                className="search-baths"
                value={formData.baths}
                onChange={handleChange}
                required
              >
                <option
                  value=""
                  disabled
                >
                  Baths
                </option>
                <option value="any">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
              <button
                type="submit"
                className="search-button"
              >
                SEARCH
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HomePage = () => {
  const [lastSearch, setLastSearch] = useState<SearchFormData | null>(null);

  return (
    <div className="app-container">
      <SearchForm onSearch={setLastSearch} />
      {lastSearch ? (
        <p className="search-feedback">
          Searching {lastSearch.city} ({lastSearch.beds} beds,{" "}
          {lastSearch.baths} baths)
        </p>
      ) : null}
    </div>
  );
};
