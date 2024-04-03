import { Component } from './base-component.js';
import { Validatable, validate } from '../utils/validation.js';
import { projectState } from '../state/project-state.js';


export class ProjectInput extends Component<HTMLDivElement,HTMLFormElement> {
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
