import $ from 'jquery';
import 'bootstrap';
import * as localForage from 'localforage';
import Contact from './module.contact';
import PubSub from '../utilities/pub-sub';

/**
 * Address Book
 *
 * Displays and manages a list of contact objects
 */
export default class AddressBook {
    constructor(query) {
        // find the address book instances in the DOM
        const addressBooks = document.querySelectorAll(query);

        // initialize each instance of the Address Book
        [].forEach.call( addressBooks, ( addrBookEl ) => {

            // setup private field data for the instance
            this._contacts = [];
            this._element = addrBookEl;
            this._events = new PubSub();

            this._addForm = this._element.querySelector('[data-add-contact-form]');
            this._saveBtn = this._addForm.querySelector('[data-save-contact]');

            // register the new contact form submit event
            if (this._addForm && this._saveBtn) {
                this._saveBtn.addEventListener('click', addContact.bind(this));
            }

            this._editForm = this._element.querySelector('[data-edit-contact-form]');
            this._editSaveBtn = this._editForm.querySelector('[data-save-edit-contact]');

            // register the edit contact form submit event
            if (this._editForm && this._editSaveBtn) {
                this._editSaveBtn.addEventListener('click', updateContact.bind(this));
            }

            // bootstrap bug: clear out the modal backdrop on successful form submit
            $('#addContact').on('hidden.bs.modal', removeModalBackdrops.bind(this));

            // bootstrap bug: clear out the modal backdrop on successful form submit
            $('#editContact').on('hidden.bs.modal', removeModalBackdrops.bind(this));

            // listen for any changes in the contact list
            this._events.subscribe('addressBook.contactsUpdated', renderContactList, this);
            this._events.subscribe('addressBook.contactsUpdated', saveContactListData, this);

            // listen for a DOM refresh completed for the contact list
            this._events.subscribe('addressBook.contactsRendered', registerContactEvents, this);

            // attempt to get any persisted contact data from localstorage
            localForage.getItem('contacts').then(value => {
                // if contacts were found in the database, re-initialize
                if (value != null) {
                    [].forEach.call(value, (contactData) => {
                        let newContact = new Contact({
                            firstName: contactData._firstName,
                            lastName: contactData._lastName,
                            email: contactData._email
                        });

                        this._contacts.push(newContact);
                    });

                    // if there was a value returned from local storage then refresh the grid data
                    this._events.publish('addressBook.contactsUpdated');
                }
            });
        });
    }
}

/**
 * Save a new Contact in the address book after the form is submitted
 */
function addContact() {
    // get the new contact information from the submitted form
    let contactData = new FormData(this._addForm);

    // create a new contact
    const newContact = new Contact(
        {
            firstName: contactData.get('contactFirstName'),
            lastName: contactData.get('contactLastName'),
            email: contactData.get('contactEmailAddress')
        });

    // add the new contact to the address book list
    this._contacts.push(newContact);

    // close the bootstrap modal window
    $('#addContact').modal('toggle');

    // clear out the "add" form values
    this._addForm.reset();

    // broadcast the event - contact list has been updated
    this._events.publish('addressBook.contactsUpdated');
}

/**
 * Edit a contact item in the contact list when the edit link is clicked
 */
function editContact(evt) {
    let contactId = evt.target.getAttribute('data-edit-contact-link'),
        contactIndx = this._contacts.findIndex(contactObj => contactObj._id == contactId);

    if (contactIndx > -1 && this._editForm) {
        // fill the edit form with the contact data
        let editFormCtrls = this._editForm.elements;

        editFormCtrls['contactId'].value = this._contacts[contactIndx]._id;
        editFormCtrls['contactFirstName'].value = this._contacts[contactIndx]._firstName;
        editFormCtrls['contactLastName'].value = this._contacts[contactIndx]._lastName;
        editFormCtrls['contactEmailAddress'].value = this._contacts[contactIndx]._email;
    }
}

/**
 * Register all UI events on the contact list after the list is refreshed in the DOM
 */
function registerContactEvents() {
    let removeLinks = this._element.querySelectorAll('[data-remove-contact-link]'),
        editLinks = this._element.querySelectorAll('[data-edit-contact-link]');

    [].forEach.call(removeLinks, (removeLink) => {
        removeLink.addEventListener('click', removeContact.bind(this));
    });

    [].forEach.call(editLinks, (editLink) => {
        editLink.addEventListener('click', editContact.bind(this));
    });
}

/**
 * Remove a contact item from the contact list when the remove link is clicked
 */
function removeContact(evt) {
    let contactId = evt.target.getAttribute('data-remove-contact-link'),
        contactIndx = this._contacts.findIndex(contactObj => contactObj._id == contactId);

    if (contactIndx > -1) {
        this._contacts.splice(contactIndx, 1);

        // broadcast the event - contact list has been updated
        this._events.publish('addressBook.contactsUpdated');
    }
}

/**
 * Fixes a bootstrap modal bug where the backdrop element
 * is not removed after the modal is dismissed
 */
function removeModalBackdrops() {
    let backdrops = document.querySelectorAll('.modal-backdrop');

    if (backdrops.length) {
        [].forEach.call(backdrops, (backdropEl) => {
            backdropEl.parentNode.removeChild(backdropEl);
        });
    } else if (backdrops.parentNode) {
        backdrops.parentNode.removeChild(backdrops);
    }
}

/**
 * Build the contact list table in the DOM after
 * the list of contacts is updated
 */
function renderContactList() {
    let contactListNode = this._element.querySelector('[data-address-book-contact-list]'),
        contactListDataNode = this._element.querySelector('[data-address-book-contact-list-data]'),
        emptyMessageNode = this._element.querySelector('[data-address-book-empty]');

    // if there are no contacts then show the empty message
    if (!this._contacts.length) {
        contactListNode.classList.add('d-none');
        emptyMessageNode.classList.remove('d-none');
    } else {
        // first sort the contact list by last name
        this._contacts.sort((a, b) => ('' + a._lastName).localeCompare(b._lastName));

        // reset the DOM with the new contact list markup
        const contactsMarkup = `${this._contacts.map(contact => contact.render())}`.split(',').join('');
        contactListDataNode.innerHTML = contactsMarkup;

        contactListNode.classList.remove('d-none');
        emptyMessageNode.classList.add('d-none');

        // broadcast the event - contact list has been rendered
        this._events.publish('addressBook.contactsRendered');
    }
}

/**
 * Persist the list of contacts to a local database
 */
function saveContactListData() {
    localForage.setItem('contacts', this._contacts);
}

/**
 * Update an existing Contact in the address book after the form is submitted
 */
function updateContact() {
    // get the new contact information from the submitted form
    let contactData = new FormData(this._editForm),
        contactId = contactData.get('contactId'),
        contactIndx = this._contacts.findIndex(contactObj => contactObj._id == contactId);

    if (contactIndx > -1) {
        this._contacts[contactIndx]._firstName = contactData.get('contactFirstName');
        this._contacts[contactIndx]._lastName = contactData.get('contactLastName');
        this._contacts[contactIndx]._email = contactData.get('contactEmailAddress');
    }

    // close the bootstrap modal window
    $('#editContact').modal('toggle');

    // broadcast the event - contact list has been updated
    this._events.publish('addressBook.contactsUpdated');
}
