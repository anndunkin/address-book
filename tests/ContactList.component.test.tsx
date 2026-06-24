import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactList } from '../src/renderer/components/ContactList';
import { ContactDetail } from '../src/renderer/components/ContactDetail';
import { Contact, emptyContact } from '../src/shared/types';

function make(overrides: Partial<Contact>): Contact {
  return { ...emptyContact(), ...overrides };
}

describe('ContactList component', () => {
  const contacts = [
    make({ id: 1, first_name: 'Ada', last_name: 'Lovelace', company: 'AE', favorite: 1 }),
    make({ id: 2, first_name: 'Alan', last_name: 'Turing', company: 'Bletchley' })
  ];

  it('renders contact rows', () => {
    render(
      <ContactList
        contacts={contacts}
        selectedId={null}
        onSelect={() => {}}
        sortKey="name"
        onSortChange={() => {}}
      />
    );
    expect(screen.getByText('Lovelace, Ada')).toBeInTheDocument();
    expect(screen.getByText('Turing, Alan')).toBeInTheDocument();
  });

  it('fires onSelect when a row is clicked', () => {
    const onSelect = jest.fn();
    render(
      <ContactList
        contacts={contacts}
        selectedId={null}
        onSelect={onSelect}
        sortKey="name"
        onSortChange={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Turing, Alan'));
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it('shows empty state with no contacts', () => {
    render(
      <ContactList
        contacts={[]}
        selectedId={null}
        onSelect={() => {}}
        sortKey="name"
        onSortChange={() => {}}
      />
    );
    expect(screen.getByText('No contacts')).toBeInTheDocument();
  });
});

describe('ContactDetail component', () => {
  it('shows a placeholder when no contact selected', () => {
    render(
      <ContactDetail
        contact={null}
        onEdit={() => {}}
        onDelete={() => {}}
        onToggleFavorite={() => {}}
        onLinkedInUpdate={() => {}}
      />
    );
    expect(screen.getByText(/Select a contact/i)).toBeInTheDocument();
  });

  it('renders contact details and a LinkedIn badge', () => {
    const contact = make({
      id: 1,
      first_name: 'Ada',
      last_name: 'Lovelace',
      title: 'Mathematician',
      company: 'AE',
      email_1: 'ada@math.org',
      linkedin_url: 'https://linkedin.com/in/ada'
    });
    render(
      <ContactDetail
        contact={contact}
        onEdit={() => {}}
        onDelete={() => {}}
        onToggleFavorite={() => {}}
        onLinkedInUpdate={() => {}}
      />
    );
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('ada@math.org')).toBeInTheDocument();
    expect(screen.getByText('Update from LinkedIn')).toBeInTheDocument();
  });
});
