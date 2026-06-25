import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MergeDialog } from '../src/renderer/components/MergeDialog';
import { Contact, NewContact, emptyContact } from '../src/shared/types';

function make(overrides: Partial<Contact>): Contact {
  return { ...emptyContact(), ...overrides };
}

const contactA = make({
  id: 1,
  first_name: 'John',
  last_name: 'Smith',
  company: 'Acme Corp',
  email_1: 'john@acme.com',
  phone_work: '555-1234'
});

const contactB = make({
  id: 2,
  first_name: 'John',
  last_name: 'Smith',
  title: 'VP Sales',
  email_1: 'john@acme.com',
  email_2: 'jsmith@gmail.com'
});

describe('MergeDialog component', () => {
  it('renders both contacts side by side with field rows', () => {
    render(
      <MergeDialog contactA={contactA} contactB={contactB} onMerge={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByRole('dialog', { name: 'Merge Contacts' })).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('VP Sales')).toBeInTheDocument();
    // identical email shows a checkmark, no radios for that row
    expect(screen.getByText('Company')).toBeInTheDocument();
  });

  it('auto-selects the non-empty value and merges with it', () => {
    let result: NewContact | null = null;
    render(
      <MergeDialog
        contactA={contactA}
        contactB={contactB}
        onMerge={(_p, _s, data) => {
          result = data;
        }}
        onCancel={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Merge & Save'));
    expect(result).not.toBeNull();
    // company only on A, title only on B -> both retained
    expect(result!.company).toBe('Acme Corp');
    expect(result!.title).toBe('VP Sales');
    expect(result!.phone_work).toBe('555-1234');
  });

  it('field-level radio selection overrides the value used', () => {
    let result: NewContact | null = null;
    render(
      <MergeDialog
        contactA={contactA}
        contactB={contactB}
        onMerge={(_p, _s, data) => {
          result = data;
        }}
        onCancel={() => {}}
      />
    );
    // Company is only on A; choose B (empty) explicitly to override.
    const companyRow = screen.getByText('Company').closest('tr')!;
    fireEvent.click(within(companyRow).getByLabelText('Company use B'));
    fireEvent.click(screen.getByText('Merge & Save'));
    expect(result!.company).toBe('');
  });

  it('Use All B selects every B value', () => {
    let result: NewContact | null = null;
    render(
      <MergeDialog
        contactA={contactA}
        contactB={contactB}
        onMerge={(_p, _s, data) => {
          result = data;
        }}
        onCancel={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Use All B →'));
    fireEvent.click(screen.getByText('Merge & Save'));
    // B has no company -> using all B clears it
    expect(result!.company).toBe('');
    expect(result!.title).toBe('VP Sales');
  });

  it('Smart Merge selects the more complete value per field', () => {
    let result: NewContact | null = null;
    const longA = make({ id: 1, first_name: 'Jon', notes: 'short' });
    const longB = make({ id: 2, first_name: 'Jonathan', notes: 'a much longer note' });
    render(
      <MergeDialog
        contactA={longA}
        contactB={longB}
        onMerge={(_p, _s, data) => {
          result = data;
        }}
        onCancel={() => {}}
      />
    );
    fireEvent.click(screen.getByText('Smart Merge'));
    fireEvent.click(screen.getByText('Merge & Save'));
    expect(result!.first_name).toBe('Jonathan');
    expect(result!.notes).toBe('a much longer note');
  });

  it('passes primary and secondary ids to onMerge', () => {
    const onMerge = jest.fn();
    render(
      <MergeDialog contactA={contactA} contactB={contactB} onMerge={onMerge} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByText('Merge & Save'));
    expect(onMerge).toHaveBeenCalledWith(1, 2, expect.any(Object));
  });
});
