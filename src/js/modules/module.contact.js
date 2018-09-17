import Guid from '../utilities/uuid';

/**
 * Contact
 *
 * Displays and manages data for a contact
 */
export default class Contact {
    constructor(data) {
        this._id = Guid();
        this._firstName = data.firstName;
        this._lastName = data.lastName;
        this._email = data.email;
    }

    render() {
        return `<tr>
            <td>${this._firstName}</td>
            <td>${this._lastName}</td>
            <td>${this._email}</td>
            <td>
                <a href="#" data-edit-contact-link="${this._id}" data-toggle="modal" data-target="#editContact">Edit</a>
            <td>
                <a href="#" data-remove-contact-link="${this._id}">Remove</a>
            </td>
        </tr>`;
    }
}
