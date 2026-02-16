import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModeListPage } from './mode-list.page';

describe('ModeListPage', () => {
  let component: ModeListPage;
  let fixture: ComponentFixture<ModeListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModeListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
