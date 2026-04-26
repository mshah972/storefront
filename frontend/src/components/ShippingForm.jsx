const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Ireland',
  'Germany', 'France', 'Netherlands', 'Spain', 'Italy',
  'Australia', 'New Zealand', 'Japan', 'Singapore', 'India',
]

export const blankShipping = {
  full_name: '',
  phone: '',
  street1: '',
  street2: '',
  city: '',
  region: '',
  postal_code: '',
  country: 'United States',
}

export function formatShippingAddress(s) {
  const lines = [
    s.full_name,
    s.phone ? `☏ ${s.phone}` : null,
    s.street1,
    s.street2 || null,
    [s.city, s.region, s.postal_code].filter(Boolean).join(', '),
    s.country,
  ].filter(Boolean)
  return lines.join('\n')
}

export function validateShipping(s) {
  const errors = {}
  if (!s.full_name.trim()) errors.full_name = 'Required'
  if (!s.street1.trim()) errors.street1 = 'Required'
  if (!s.city.trim()) errors.city = 'Required'
  if (!s.region.trim()) errors.region = 'Required'
  if (!s.postal_code.trim()) errors.postal_code = 'Required'
  if (!s.country.trim()) errors.country = 'Required'
  return errors
}

function Field({ label, optional, error, children, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="field-label">
        {label} {optional && <span className="text-ink-ghost font-normal normal-case">(optional)</span>}
      </label>
      {children}
      {error && <div className="mt-1.5 text-xs text-danger">{error}</div>}
    </div>
  )
}

export default function ShippingForm({ value, onChange, errors = {} }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value })

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full name" error={errors.full_name} htmlFor="full_name">
          <input
            id="full_name"
            className="input"
            autoComplete="name"
            required
            value={value.full_name}
            onChange={set('full_name')}
            placeholder="Jane Doe"
          />
        </Field>
        <Field label="Phone" optional htmlFor="phone">
          <input
            id="phone"
            type="tel"
            className="input"
            autoComplete="tel"
            value={value.phone}
            onChange={set('phone')}
            placeholder="+1 (555) 010-2030"
          />
        </Field>
      </div>

      <Field label="Country / Region" error={errors.country} htmlFor="country">
        <select
          id="country"
          className="input"
          autoComplete="country-name"
          required
          value={value.country}
          onChange={set('country')}
        >
          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>

      <Field label="Street address" error={errors.street1} htmlFor="street1">
        <input
          id="street1"
          className="input"
          autoComplete="address-line1"
          required
          value={value.street1}
          onChange={set('street1')}
          placeholder="123 Maple Avenue"
        />
      </Field>

      <Field label="Apartment, suite, etc." optional htmlFor="street2">
        <input
          id="street2"
          className="input"
          autoComplete="address-line2"
          value={value.street2}
          onChange={set('street2')}
          placeholder="Apt 4B"
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="City" error={errors.city} htmlFor="city">
          <input
            id="city"
            className="input"
            autoComplete="address-level2"
            required
            value={value.city}
            onChange={set('city')}
            placeholder="Brooklyn"
          />
        </Field>
        <Field label="State / Region" error={errors.region} htmlFor="region">
          <input
            id="region"
            className="input"
            autoComplete="address-level1"
            required
            value={value.region}
            onChange={set('region')}
            placeholder="NY"
          />
        </Field>
        <Field label="ZIP / Postal code" error={errors.postal_code} htmlFor="postal_code">
          <input
            id="postal_code"
            className="input"
            autoComplete="postal-code"
            required
            value={value.postal_code}
            onChange={set('postal_code')}
            placeholder="11201"
          />
        </Field>
      </div>
    </div>
  )
}
