// Barrell file is an index.ts (or index.js) file that re-exports items from multiple files in a directory. This allows us to import everything from a single place, making our imports cleaner and easier to manage

export { Booking } from "./booking.model";
export { Hall } from "./hall.model";
export { Movie } from "./movie.model";
export { Show } from "./show.model";
export { User } from "./user.model";
export { Screen } from "./screen.model";
export { Seat } from "./seat.model";
export { Payment } from "./payment.model";
