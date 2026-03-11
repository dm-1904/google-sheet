import { ChangeEvent, FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/HomePage.css';
import '../css/ContactUs.css';

export interface SearchFormData {
  city: string;
  minPrice: number | '';
  maxPrice: number | '';
  beds: string;
  baths: string;
}

interface SearchFormProps {
  onSearch: (data: SearchFormData) => void;
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
}

export const SearchForm = ({ onSearch }: SearchFormProps) => {
  const [formData, setFormData] = useState<SearchFormData>({
    city: '',
    minPrice: '',
    maxPrice: '',
    beds: '',
    baths: '',
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const fieldName = name as keyof SearchFormData;

    let nextValue: SearchFormData[keyof SearchFormData];
    if (fieldName === 'minPrice' || fieldName === 'maxPrice') {
      nextValue = value === '' ? '' : Number(value);
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
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">DEAL LANDERS ARIZONA REALTY</h1>
        <div className="form-box">
          <div className="buy-or-sell">
            <h2 className="buy-a-home">Buy a Home</h2>
            <Link to="/lets-connect" className="sell-a-home">
              Sell a Home
            </Link>
          </div>
          <div className="form-container">
            <form onSubmit={handleSubmit} className="search-form">
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
                <option value="" disabled>
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
                <option value="" disabled>
                  Baths
                </option>
                <option value="any">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
              <button type="submit" className="search-button">
                SEARCH
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ContactForm = ({ onSubmit }: ContactFormProps) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<keyof ContactFormData, string>>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    const fieldName = name as keyof ContactFormData;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => ({ ...prev, [fieldName]: '' }));
  };

  const validate = () => {
    const newErrors: Record<keyof ContactFormData, string> = {
      name: '',
      email: '',
      phone: '',
      message: '',
    };

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <section className="contact-form-box">
      <div className="contact-form-header">
        <h2>LET&apos;S CONNECT!</h2>
      </div>
      <hr />
      <div className="form-content">
        <form onSubmit={handleSubmit} className="contact-form" noValidate>
          <div className="contact-form-field">
            <input
              required
              type="text"
              name="name"
              className="contact-form-name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
            />
            {errors.name ? <span className="error">{errors.name}</span> : null}
          </div>

          <div className="contact-form-field">
            <input
              required
              name="email"
              type="email"
              className="contact-form-email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
            {errors.email ? <span className="error">{errors.email}</span> : null}
          </div>

          <div className="contact-form-field">
            <input
              required
              name="phone"
              type="tel"
              className="contact-form-phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone"
            />
            {errors.phone ? <span className="error">{errors.phone}</span> : null}
          </div>

          <div className="contact-form-field">
            <textarea
              required
              name="message"
              className="contact-form-message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="Question or Message"
            />
            {errors.message ? <span className="error">{errors.message}</span> : null}
          </div>

          <span className="contact-form-consent">
            *By clicking &quot;Submit&quot; you are expressly consenting to receive communications from Desert
            Valley Home Search and its affiliates via email, phone, or text. You may opt out at any time.
            Your information will not be shared with or sold to third parties. For more information, please
            see our <a href="#" className="terms">Terms of Use</a> and{' '}
            <a href="#" className="privacy">Privacy Policy</a>.
          </span>

          <button type="submit" className="contact-form-submit-btn">
            SUBMIT
          </button>
        </form>
      </div>
    </section>
  );
};

export const HomePage = () => {
  const [lastSearch, setLastSearch] = useState<SearchFormData | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (_data: ContactFormData) => {
    setContactSubmitted(true);
  };

  return (
    <div className="app-container">
      <SearchForm onSearch={setLastSearch} />
      {lastSearch ? (
        <p className="search-feedback">
          Searching {lastSearch.city} ({lastSearch.beds} beds, {lastSearch.baths} baths)
        </p>
      ) : null}

      <ContactForm onSubmit={handleContactSubmit} />
      {contactSubmitted ? <p className="contact-feedback">Thanks. Your message has been submitted.</p> : null}
    </div>
  );
};
