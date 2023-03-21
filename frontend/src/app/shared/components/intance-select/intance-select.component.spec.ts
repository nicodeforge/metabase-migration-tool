import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponents } from 'ng-mocks';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IntanceSelectComponent } from './intance-select.component';
import { MetabaseInstanceService } from '../../../feature/metabase-instance/services/metabase-instance.service';
import { MetabaseInstanceDto } from '../../../feature/metabase-instance/dto/metabase-instance.dto';
import { SelectButton } from 'primeng/selectbutton';
import { MultiSelect } from 'primeng/multiselect';

describe('IntanceSelectComponent', () => {
  let component: IntanceSelectComponent;
  let fixture: ComponentFixture<IntanceSelectComponent>;
  let formBuilder: FormBuilder;
  const fakeInstanceId1 = '__FAKE_ID_1__';
  const fakeInstanceId2 = '__FAKE_ID_2__';
  const instancesMock: MetabaseInstanceDto[] = [
    {
      id: fakeInstanceId1,
      url: 'http://test.test',
      username: 'john',
      password: 'doo',
      name: 'Test',
      token: '__FAKE_TOKEN_1__',
    },
    {
      id: fakeInstanceId2,
      url: 'http://test.test',
      username: 'john',
      password: 'doo',
      name: 'Test',
      token: '__FAKE_TOKEN_2__',
    },
  ];
  const instanceServiceMock = {
    getInstances: jest.fn().mockReturnValue(instancesMock),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        IntanceSelectComponent,
        MockComponents(SelectButton, MultiSelect),
      ],
      imports: [ReactiveFormsModule],
      providers: [
        {
          provide: MetabaseInstanceService,
          useValue: instanceServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IntanceSelectComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
    component.ngOnInit();
    /*component.instanceForm = formBuilder.group({
      originInstance: new FormControl({
        value: fakeInstanceId1,
        disabled: false,
      }),
      destinationInstance: new FormControl({
        value: fakeInstanceId2,
        disabled: false,
      }),
    });*/
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch a list of instances at startup', async () => {
    expect(component.instanceList.length).toBe(2);
  });

  it('should set the instance select option at startup', () => {
    expect(component.instances.length).toBe(2);
  });

  it('should set form options', () => {
    console.log(component.instanceForm);
    expect(component.instanceForm).toBeDefined();
  });

  it('should set originInstance when user selects it', () => {
    const originInstanceElement: HTMLSelectElement =
      fixture.debugElement.nativeElement.querySelector(
        '#destinationInstanceSelect'
      );
    originInstanceElement.value = instancesMock[0].id;
    originInstanceElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      console.log(component.instanceForm);
      expect(originInstanceElement.value).toEqual(instancesMock[0].id);
    });
  });
});
