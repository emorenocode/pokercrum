import { Card } from '@/app/core/models/card.model';
import { Component, input, output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'ui-card',
  imports: [MatTooltipModule],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class UICard {
  card = input.required<Card>();
  isSelected = input<boolean>();
  isDisabled = input<boolean>();
  onSelect = output<Card>();
}
