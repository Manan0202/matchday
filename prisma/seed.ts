import 'dotenv/config'
import { PrismaClient, EventStatus, SeatStatus } from '../src/generated/prisma'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const prisma = process.env.TURSO_DATABASE_URL
    ? new PrismaClient({
          adapter: new PrismaLibSQL({
              url: process.env.TURSO_DATABASE_URL,
              authToken: process.env.TURSO_AUTH_TOKEN,
          }),
      })
    : new PrismaClient()

const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000)

async function main() {
    await prisma.bookingSeat.deleteMany()
    await prisma.booking.deleteMany()
    await prisma.waitlistEntry.deleteMany()
    await prisma.seat.deleteMany()
    await prisma.eventSection.deleteMany()
    await prisma.event.deleteMany()
    await prisma.section.deleteMany()
    await prisma.venue.deleteMany()
    await prisma.team.deleteMany()
    await prisma.sport.deleteMany()
    await prisma.user.deleteMany()

    const [football, cricket, basketball] = await Promise.all([
        prisma.sport.create({ data: { name: 'Football', slug: 'football' } }),
        prisma.sport.create({ data: { name: 'Cricket', slug: 'cricket' } }),
        prisma.sport.create({ data: { name: 'Basketball', slug: 'basketball' } }),
    ])

    const [arsenal, manCity, liverpool, chelsea] = await Promise.all([
        prisma.team.create({ data: { name: 'Arsenal', shortName: 'ARS', sportId: football.id } }),
        prisma.team.create({ data: { name: 'Manchester City', shortName: 'MCI', sportId: football.id } }),
        prisma.team.create({ data: { name: 'Liverpool', shortName: 'LIV', sportId: football.id } }),
        prisma.team.create({ data: { name: 'Chelsea', shortName: 'CHE', sportId: football.id } }),
    ])

    const [mumbaiIndians, chennaiSuperKings, india, australia] = await Promise.all([
        prisma.team.create({ data: { name: 'Mumbai Indians', shortName: 'MI', sportId: cricket.id } }),
        prisma.team.create({ data: { name: 'Chennai Super Kings', shortName: 'CSK', sportId: cricket.id } }),
        prisma.team.create({ data: { name: 'India', shortName: 'IND', sportId: cricket.id } }),
        prisma.team.create({ data: { name: 'Australia', shortName: 'AUS', sportId: cricket.id } }),
    ])

    const [lakers, celtics, warriors, bulls] = await Promise.all([
        prisma.team.create({ data: { name: 'Los Angeles Lakers', shortName: 'LAL', sportId: basketball.id } }),
        prisma.team.create({ data: { name: 'Boston Celtics', shortName: 'BOS', sportId: basketball.id } }),
        prisma.team.create({ data: { name: 'Golden State Warriors', shortName: 'GSW', sportId: basketball.id } }),
        prisma.team.create({ data: { name: 'Chicago Bulls', shortName: 'CHI', sportId: basketball.id } }),
    ])

    const emirates = await prisma.venue.create({
        data: {
            name: 'Emirates Stadium',
            city: 'London',
            capacity: 60704,
            sections: {
                create: [
                    { name: 'Lower Tier', rows: 4, seatsPerRow: 8 },
                    { name: 'Club Level', rows: 2, seatsPerRow: 6 },
                ],
            },
        },
        include: { sections: true },
    })

    const wankhede = await prisma.venue.create({
        data: {
            name: 'Wankhede Stadium',
            city: 'Mumbai',
            capacity: 33108,
            sections: {
                create: [
                    { name: 'North Stand', rows: 4, seatsPerRow: 8 },
                    { name: 'Sachin Tendulkar Stand', rows: 2, seatsPerRow: 6 },
                ],
            },
        },
        include: { sections: true },
    })

    const cryptoArena = await prisma.venue.create({
        data: {
            name: 'Crypto.com Arena',
            city: 'Los Angeles',
            capacity: 19068,
            sections: {
                create: [
                    { name: 'Upper Bowl', rows: 4, seatsPerRow: 8 },
                    { name: 'Courtside', rows: 1, seatsPerRow: 6 },
                ],
            },
        },
        include: { sections: true },
    })

    type EventSeed = {
        sportId: string
        league: string
        homeTeamId: string
        awayTeamId: string
        venue: typeof emirates
        startTime: Date
        status: EventStatus
        soldOut?: boolean
    }

    const eventSeeds: EventSeed[] = [
        {
            sportId: football.id,
            league: 'Premier League',
            homeTeamId: arsenal.id,
            awayTeamId: manCity.id,
            venue: emirates,
            startTime: hoursFromNow(72),
            status: EventStatus.UPCOMING,
        },
        {
            sportId: football.id,
            league: 'Premier League',
            homeTeamId: liverpool.id,
            awayTeamId: chelsea.id,
            venue: emirates,
            startTime: hoursFromNow(0.5),
            status: EventStatus.LIVE,
        },
        {
            sportId: football.id,
            league: 'Premier League',
            homeTeamId: arsenal.id,
            awayTeamId: chelsea.id,
            venue: emirates,
            startTime: hoursFromNow(-48),
            status: EventStatus.FINISHED,
        },
        {
            sportId: cricket.id,
            league: 'IPL',
            homeTeamId: mumbaiIndians.id,
            awayTeamId: chennaiSuperKings.id,
            venue: wankhede,
            startTime: hoursFromNow(24),
            status: EventStatus.UPCOMING,
            soldOut: true,
        },
        {
            sportId: cricket.id,
            league: 'International',
            homeTeamId: india.id,
            awayTeamId: australia.id,
            venue: wankhede,
            startTime: hoursFromNow(120),
            status: EventStatus.UPCOMING,
        },
        {
            sportId: basketball.id,
            league: 'NBA',
            homeTeamId: lakers.id,
            awayTeamId: celtics.id,
            venue: cryptoArena,
            startTime: hoursFromNow(96),
            status: EventStatus.UPCOMING,
        },
        {
            sportId: basketball.id,
            league: 'NBA',
            homeTeamId: warriors.id,
            awayTeamId: bulls.id,
            venue: cryptoArena,
            startTime: hoursFromNow(-12),
            status: EventStatus.FINISHED,
        },
    ]

    for (const seed of eventSeeds) {
        const event = await prisma.event.create({
            data: {
                sportId: seed.sportId,
                league: seed.league,
                homeTeamId: seed.homeTeamId,
                awayTeamId: seed.awayTeamId,
                venueId: seed.venue.id,
                startTime: seed.startTime,
                status: seed.status,
            },
        })

        for (const [index, section] of seed.venue.sections.entries()) {
            const price = index === 0 ? 45 : 120
            const eventSection = await prisma.eventSection.create({
                data: { eventId: event.id, sectionId: section.id, price },
            })

            const seatsData = []
            for (let row = 1; row <= section.rows; row++) {
                for (let number = 1; number <= section.seatsPerRow; number++) {
                    seatsData.push({
                        eventSectionId: eventSection.id,
                        row,
                        number,
                        status: seed.soldOut ? SeatStatus.SOLD : SeatStatus.AVAILABLE,
                    })
                }
            }
            await prisma.seat.createMany({ data: seatsData })
        }
    }

    const passwordHash = await bcrypt.hash('password123', 10)
    await prisma.user.create({
        data: {
            email: 'admin@matchday.dev',
            name: 'Admin',
            role: 'ADMIN',
            passwordHash,
        },
    })
    await prisma.user.create({
        data: {
            email: 'fan@matchday.dev',
            name: 'Sample Fan',
            role: 'USER',
            passwordHash,
        },
    })

    console.log('Seed complete.')
}

main()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
