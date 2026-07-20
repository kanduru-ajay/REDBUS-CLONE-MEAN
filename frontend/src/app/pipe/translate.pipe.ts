import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService } from '../service/i18n.service';

@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription: Subscription;

  constructor(private i18n: I18nService, changeDetector: ChangeDetectorRef) {
    this.subscription = this.i18n.language$.subscribe(() => changeDetector.markForCheck());
  }

  transform(key: string): string {
    return this.i18n.translate(key);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
