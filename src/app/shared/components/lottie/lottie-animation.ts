import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-lottie',
  standalone: true,
  imports: [CommonModule, LottieComponent],
  styles: [`:host { display: block; width: 100%; height: 100%; }`],
  template: `
    <ng-lottie
      [options]="lottieOptions"
      [width]="width"
      [height]="height"
      [styles]="containerStyles"
      (animationCreated)="onCreated($event)"
      style="display:block;width:100%;height:100%"
    />
  `,
})
export class LottieAnimation implements OnDestroy {
  @Input() path = '';                    // path to .json file in /public
  @Input() width = '100%';
  @Input() height = '100%';
  @Input() loop = true;
  @Input() autoplay = true;
  @Input() speed = 1;
  @Input() containerStyles: Partial<CSSStyleDeclaration> = {};

  private animationItem?: AnimationItem;

  get lottieOptions(): AnimationOptions {
    return {
      path: this.path,
      loop: this.loop,
      autoplay: this.autoplay,
    };
  }

  onCreated(animation: AnimationItem) {
    this.animationItem = animation;
    animation.setSpeed(this.speed);
  }

  ngOnDestroy() {
    this.animationItem?.destroy();
  }
}
