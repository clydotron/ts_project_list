// autobind decorator:
function autobind(
  _: any, //replace with _
  _2: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const adjDecriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    }
  };
  return adjDecriptor;
 }
// autobind decorator
// function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
//   const originalMethod = descriptor.value;
//   const adjDescriptor: PropertyDescriptor = {
//     configurable: true,
//     get() {
//       const boundFn = originalMethod.bind(this);
//       return boundFn;
//     }
//   };
//   return adjDescriptor;
// }




// Drag and Drop interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
};

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
};


// PROJECT
enum ProjectStatus { Active, Finished }

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) { }
}

type Listener<T> = (projects: T[]) => void

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFcn: Listener<T>) {
    this.listeners.push(listenerFcn);
  }
};

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new ProjectState()
    }
    return this.instance
  }

  addProject(title: string, description: string, numPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numPeople,
      ProjectStatus.Active
    );

    this.projects.push(newProject)
    this.updateListeners()
  }

  moveProject(projectId: string, status: ProjectStatus) {
    const project = this.projects.find(project => project.id === projectId);
    if (project && project.status !== status ) {
      project.status = status;
      this.updateListeners()
    }
  }

  private updateListeners() {
    for (const listenerFcn of this.listeners) {
      listenerFcn(this.projects.slice());
    }
  }
}
 
const projectState = ProjectState.getInstance();



// Validation:
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

// @TODO implement as class too
function validate(v: Validatable) {
  if (v.required) {
    if (v.value.toString().trim().length === 0) {
      return false
    }
  }

  if (v.minLength != null && typeof v.value === 'string') {
    if (v.value.length < v.minLength) {
      return false;
    } 
  }

  if (v.maxLength != null && typeof v.value === 'string') {
    if (v.value.length > v.maxLength) {
      return false;
    } 
  }

  if (v.min != null && typeof v.value === 'number') {
    if (v.value < v.min) {
      return false;
    } 
  }

  if (v.max != null && typeof v.value === 'number') {
    if (v.value > v.max) {
      return false;
    } 
  }

  return true;
}

abstract class Component<T extends HTMLElement,U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importNode = document.importNode(this.templateElement.content, true);
    this.element = importNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart)
  }

  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? 'afterbegin' : 'beforeend', this.element)
  }

  abstract configure(): void;
  abstract renderContent(): void
}

// PROJECT ITEM
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project;

  get people() {
    if (this.project.people === 1) {
      return '1 person'
    }
    return `${this.project.people} people`
  }

  constructor(hostId: string, project: Project) {
    super('single-project',hostId, false,`project-${project.id}`);
    this.project = project;

    this.configure()
    this.renderContent();
  }

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler.bind(this));
    this.element.addEventListener('dragend', this.dragEndHandler.bind(this));
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.people + " assigned";
    this.element.querySelector('p')!.textContent = this.project.description;
  }

  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  dragEndHandler(event: DragEvent): void {
  }
}

// PROJECT LIST
class ProjectList extends Component<HTMLDivElement,HTMLElement> implements DragTarget {
  projects: Project[]

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.projects = []

    this.configure();
    this.renderContent();
  }

  dragOverHandler(event: DragEvent): void {
    // check if drag allowed:
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listElem = this.element.querySelector('ul')!; 
      listElem.classList.add('droppable');
    }
  }

  dropHandler(event: DragEvent): void {
    const projectId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(projectId,this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished )
  }

  dragLeaveHandler(_: DragEvent): void {
    const listElem = this.element.querySelector('ul')!; 
    listElem.classList.remove('droppable');
  }


  configure() {

    this.element.addEventListener('dragover', this.dragOverHandler.bind(this));
    this.element.addEventListener('dragleave', this.dragLeaveHandler.bind(this));
    this.element.addEventListener('drop', this.dropHandler.bind(this));
    
    projectState.addListener((projects: Project[]) => {
      this.projects = projects.filter(project => {
        if (this.type === 'active') {
          return (project.status === ProjectStatus.Active);
        }

        return (project.status === ProjectStatus.Finished);
      });

      this.renderProjects();
    });
   }
  
  renderContent() {
    const listId = `${this.type}-projects-list`
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  }

  private renderProjects() {
    
    // get the list element, clear any existing content
    const listElem = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listElem.innerHTML = ''; 
    for (const project of this.projects) {
      new ProjectItem(this.element.querySelector('ul')!.id, project);
    }
  }
}

class ProjectInput extends Component<HTMLDivElement,HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() { 
    super('project-input','app',true,'user-input');

    this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;

    this.configure();
  } 
  
  renderContent(): void {
      
  }

  // @autobind could not get to work
  configure() {
    this.element.addEventListener('submit', this.submitHandler.bind(this))
  }

  private submitHandler(event: Event) {
    event.preventDefault();

    const userInput = this.gatherUserInput()
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  private gatherUserInput(): [string, string, number] | void {
    const title = this.titleInputElement.value;
    const description = this.descriptionInputElement.value;
    const people = this.peopleInputElement.value;
    
    const titleValidator: Validatable = {
      value: title,
      required: true,
    }

    const descriptionValidator: Validatable = {
      value: description,
      required: true,
      minLength: 5
    }
    
    const peopleValidator: Validatable = {
      value: +people,
      required: true,
      min: 1,
      max: 5
    }

    // validate input
    if (!validate(titleValidator) || !validate(descriptionValidator) || !validate(peopleValidator) ) {
      alert('Invalid input, please try again');
      return;
    } else {
      return [title, description, +people];
    }
  }

}

// add ! to indicate that this will never be null


const projectInput = new ProjectInput();

const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');