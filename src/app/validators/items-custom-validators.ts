import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function twoOutOfThreeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const canBeSold = control.get('canBeSold')?.value;
    const canBePurchased = control.get('canBePurchased')?.value;
    const canBeConsumed = control.get('canBeConsumed')?.value;

    const trueCount = [canBeSold, canBePurchased, canBeConsumed].filter(val => val === true).length;

    return trueCount >= 1 ? null : { twoOutOfThree: true }; // Return error if fewer than 2 are true
  };
}
