import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DuplicateFinder } from '../src/renderer/components/DuplicateFinder';
import { Contact, DuplicateGroup, emptyContact } from '../src/shared/types';

function make(overrides: Partial<Contact>): Contact {
  return { ...emptyContact(), ...overrides };
}

const groups: DuplicateGroup[] = [
  {
    confidence: 'high',
    reason: 'Same email: john@acme.com',
    contacts: [
      make({ id: 1, first_name: 'John', last_name: 'Smith', email_1: 'john@acme.com', company: 'Acme' }),
      make({ id: 2, first_name: 'John', last_name: 'Smith', email_1: 'john@acme.com' })
    ]
  },
  {
    confidence: 'medium',
    reason: 'Same name: David Johnson',
    contacts: [
      make({ id: 3, first_name: 'David', last_name: 'Johnson', email_1: 'd.j@gmail.com' }),
      make({ id: 4, first_name: 'David', last_name: 'Johnson', email_1: 'd.johnson@doe.gov' })
    ]
  }
];

describe('DuplicateFinder component', () => {
  it('renders the duplicate groups with a total count', () => {
    render(
      <DuplicateFinder groups={groups} onReview={() => {}} onMergeAllHigh={() => {}} onClose={() => {}} />
    );
    expect(screen.getByText('Found 2 potential duplicate groups')).toBeInTheDocument();
    expect(screen.getByText(/HIGH/)).toBeInTheDocument();
    expect(screen.getByText(/MEDIUM/)).toBeInTheDocument();
  });

  it('calls onReview with the group when Review & Merge is clicked', () => {
    const onReview = jest.fn();
    render(
      <DuplicateFinder groups={groups} onReview={onReview} onMergeAllHigh={() => {}} onClose={() => {}} />
    );
    fireEvent.click(screen.getAllByText('Review & Merge')[0]);
    expect(onReview).toHaveBeenCalledWith(groups[0]);
  });

  it('Skip dismisses a group and updates the count', () => {
    render(
      <DuplicateFinder groups={groups} onReview={() => {}} onMergeAllHigh={() => {}} onClose={() => {}} />
    );
    expect(screen.getByText('Found 2 potential duplicate groups')).toBeInTheDocument();
    fireEvent.click(screen.getAllByText('Skip')[0]);
    expect(screen.getByText('Found 1 potential duplicate group')).toBeInTheDocument();
  });

  it('shows Merge All High-Confidence only when a high group exists', () => {
    const onMergeAllHigh = jest.fn();
    render(
      <DuplicateFinder groups={groups} onReview={() => {}} onMergeAllHigh={onMergeAllHigh} onClose={() => {}} />
    );
    const btn = screen.getByText('Merge All High-Confidence');
    fireEvent.click(btn);
    expect(onMergeAllHigh).toHaveBeenCalled();
  });

  it('hides the high-confidence batch button when only low/medium groups remain', () => {
    render(
      <DuplicateFinder
        groups={[groups[1]]}
        onReview={() => {}}
        onMergeAllHigh={() => {}}
        onClose={() => {}}
      />
    );
    expect(screen.queryByText('Merge All High-Confidence')).not.toBeInTheDocument();
  });
});
