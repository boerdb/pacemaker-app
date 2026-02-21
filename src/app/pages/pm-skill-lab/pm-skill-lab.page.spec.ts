import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PmSkillLabPage } from './pm-skill-lab.page';

describe('PmSkillLabPage', () => {
  let component: PmSkillLabPage;
  let fixture: ComponentFixture<PmSkillLabPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PmSkillLabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
