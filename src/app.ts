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
      Math.random.toString(),
      title,
      description,
      numPeople,
      ProjectStatus.Active
    );

    this.projects.push(newProject)

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


// PROJECT LIST
class ProjectList extends Component<HTMLDivElement,HTMLElement> {
  projects: Project[]

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.projects = []

    this.configure();
    this.renderContent();
  }

  private renderProjects() {
    
    // get the list element, clear any existing content
    const listElem = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listElem.innerHTML = ''; 
    for (const project of this.projects) {
      const listItem = document.createElement('li');
      listItem.textContent = project.title;
      listElem.appendChild(listItem);
    }
  }

  configure() {
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
      console.log(title, desc, people);

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