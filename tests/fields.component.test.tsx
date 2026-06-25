import React from 'react';
import { render, screen } from '@testing-library/react';
import { ContactDetail } from '../src/renderer/components/ContactDetail';
import { ContactForm } from '../src/renderer/components/ContactForm';
import { FieldMapper } from '../src/renderer/components/FieldMapper';
import { Contact, emptyContact } from '../src/shared/types';

function make(overrides: Partial<Contact>): Contact {
  return { ...emptyContact(), ...overrides };
}

describe('ContactDetail extended fields', () => {
  it('renders grouped sections when extended fields are populated', () => {
    const contact = make({
      id: 1,
      first_name: 'Ada',
      last_name: 'Lovelace',
      birthday: '1815-12-10',
      spouse: 'William',
      home_city: 'London',
      department: 'Research',
      user_1: 'VIP'
    });
    render(
      <ContactDetail
        contact={contact}
        onEdit={() => {}}
        onDelete={() => {}}
        onToggleFavorite={() => {}}
        onLinkedInUpdate={() => {}}
        onMergeWith={() => {}}
      />
    );
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('1815-12-10')).toBeInTheDocument();
    expect(screen.getByText('William')).toBeInTheDocument();
    expect(screen.getByText('Home Address')).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Additional')).toBeInTheDocument();
    expect(screen.getByText('Research')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
  });

  it('omits extended sections when those fields are empty', () => {
    const contact = make({ id: 1, first_name: 'Plain', last_name: 'Jane' });
    render(
      <ContactDetail
        contact={contact}
        onEdit={() => {}}
        onDelete={() => {}}
        onToggleFavorite={() => {}}
        onLinkedInUpdate={() => {}}
        onMergeWith={() => {}}
      />
    );
    expect(screen.queryByText('Personal')).not.toBeInTheDocument();
    expect(screen.queryByText('Home Address')).not.toBeInTheDocument();
    expect(screen.queryByText('Additional')).not.toBeInTheDocument();
  });
});

describe('ContactForm extended fields', () => {
  it('renders inputs for the extended fields', () => {
    render(<ContactForm initial={null} onSave={() => {}} onCancel={() => {}} />);
    for (const label of [
      'Birthday',
      'Anniversary',
      'Spouse',
      'Children',
      'Home City',
      'Department',
      'Assistant Name',
      'Custom Field 1',
      'Custom Field 4'
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});

describe('FieldMapper targets', () => {
  it('offers the extended fields as mapping targets', () => {
    render(
      <FieldMapper
        headers={['Column A']}
        initialMapping={{}}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    const options = screen.getAllByRole('option').map((o) => (o as HTMLOptionElement).value);
    for (const field of [
      'birthday',
      'anniversary',
      'spouse',
      'home_city',
      'department',
      'assistant_name',
      'user_1',
      'user_4'
    ]) {
      expect(options).toContain(field);
    }
  });
});
