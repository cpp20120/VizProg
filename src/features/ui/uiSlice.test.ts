import { describe, expect, it } from 'vitest';
import { setSaveStatus, uiReducer } from '@features/ui/uiSlice';

describe('uiSlice', () => {
  it('stores save status', () => {
    expect(uiReducer(undefined, setSaveStatus('saving')).saveStatus).toBe('saving');
  });
});
