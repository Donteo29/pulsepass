import { http, HttpResponse } from 'msw'

const user = {
  id: 1,
  username: 'ana',
  email: 'ana@example.test',
  active: true,
  firstName: 'Ana',
  lastName: 'Perez',
  birthDate: '1995-05-15',
}

const authenticatedUser = {
  identifier: 1,
  username: 'ana',
  email: 'ana@example.test',
  roles: ['USER'],
}

const venue = {
  id: 1,
  code: 'VEN-SMR-01',
  name: 'Marina Convention Center',
  city: 'Santa Marta',
  address: 'Carrera 1 # 22-45',
  capacity: 500,
  active: true,
}

const artist = {
  id: 1,
  stageName: 'Solar Beat',
  country: 'Colombia',
  genre: 'Electronic',
  active: true,
}

const event = {
  id: 1,
  eventCode: 'PP-E2E-1',
  name: 'PulsePass Demo',
  description: 'Evento de prueba',
  category: 'MUSIC',
  status: 'PUBLISHED',
  eventDate: '2030-08-20T20:00:00',
  minimumAge: 18,
  venueCode: venue.code,
  venueName: venue.name,
  artists: [artist],
}

const ticket = {
  id: 1,
  ticketCode: 'TCK-TEST-1',
  type: 'GENERAL',
  price: 100000,
  status: 'PAID',
  purchaseDate: '2026-11-21T12:00:00',
  userEmail: user.email,
  eventCode: event.eventCode,
  eventName: event.name,
}

export const handlers = [
  http.post('http://localhost/api/auth/login', () => HttpResponse.json({
    accessToken: 'test-access-token',
    tokenType: 'Bearer',
    expiresIn: 900,
  })),
  http.get('http://localhost/api/auth/me', () => HttpResponse.json(authenticatedUser)),

  http.get('http://localhost/api/venues/active', () => HttpResponse.json([venue])),
  http.get('http://localhost/api/venues/:code', () => HttpResponse.json(venue)),

  http.get('http://localhost/api/events/published', () => HttpResponse.json([event])),
  http.get('http://localhost/api/events/by-artist', () => HttpResponse.json([event])),
  http.get('http://localhost/api/events/:eventCode/tickets/paid', () => HttpResponse.json([ticket])),
  http.post('http://localhost/api/events/:eventCode/artists/:artistId', () => HttpResponse.json(event)),
  http.patch('http://localhost/api/events/:eventCode/publish', () => HttpResponse.json(event)),
  http.post('http://localhost/api/events', () => HttpResponse.json(event, { status: 201 })),
  http.get('http://localhost/api/events/:eventCode', () => HttpResponse.json(event)),

  http.get('http://localhost/api/artists/active', () => HttpResponse.json([artist])),
  http.get('http://localhost/api/artists/by-stage-name', () => HttpResponse.json(artist)),
  http.get('http://localhost/api/artists/:id', () => HttpResponse.json(artist)),

  http.post('http://localhost/api/users', () => HttpResponse.json(user, { status: 201 })),
  http.get('http://localhost/api/users/by-email', () => HttpResponse.json(user)),
  http.get('http://localhost/api/users/by-username', () => HttpResponse.json(user)),

  http.get('http://localhost/api/tickets/by-user', () => HttpResponse.json([ticket])),
  http.get('http://localhost/api/tickets/:ticketCode', () => HttpResponse.json(ticket)),
  http.post('http://localhost/api/tickets', () => HttpResponse.json(ticket, { status: 201 })),
  http.patch('http://localhost/api/tickets/:ticketCode/cancel', () => HttpResponse.json({
    ...ticket,
    status: 'CANCELLED',
  })),
  http.patch('http://localhost/api/tickets/:ticketCode/use', () => HttpResponse.json({
    ...ticket,
    status: 'USED',
  })),
]
