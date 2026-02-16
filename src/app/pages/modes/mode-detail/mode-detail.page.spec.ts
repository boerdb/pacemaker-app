import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModeDetailPage } from './mode-detail.page';

describe('ModeDetailPage', () => {
  let component: ModeDetailPage;
  let fixture: ComponentFixture<ModeDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModeDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
