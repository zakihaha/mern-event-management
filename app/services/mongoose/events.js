const Events = require('../../api/v1/events/model')
const { BadRequestError, NotFoundError } = require('../../errors')
const { checkingCategories } = require('./categories')
const { checkingImage } = require('./images')
const { checkingTalents } = require('./talents')

const getAllEvents = async (req) => {
    const { keyword, category, talent, status } = req.query

    let condition = {}

    if (keyword) {
        condition = { ...condition, title: { $regex: keyword, $options: 'i' } }
    }

    if (category) {
        condition = { ...condition, category }
    }

    if (talent) {
        condition = { ...condition, talent }
    }

    if (status) {
        condition = { ...condition, statusEvent: status }
    }

    const result = await Events.find(condition)
        .populate({
            path: 'image',
            select: '_id name'
        })
        .populate({
            path: 'category',
            select: '_id name'
        })
        .populate({
            path: 'talent',
            select: '_id name role image',
            populate: {
                path: 'image',
                select: '_id name'
            }
        })

    return result
}

const createEvents = async (req) => {
    const {
        title,
        date,
        about,
        tagline,
        keyPoint,
        venueName,
        statusEvent,
        tickets,
        image,
        category,
        talent
    } = req.body

    await checkingImage(image)
    await checkingCategories(category)
    await checkingTalents(talent)

    const check = await Events.findOne({ title })
    if (check) throw new BadRequestError('Title must be unique')

    const result = await Events.create({
        title,
        date,
        about,
        tagline,
        keyPoint,
        venueName,
        statusEvent,
        tickets,
        image,
        category,
        talent
    })

    return result
}

const getOneEvents = async (req) => {
    const { id } = req.params

    const result = await Events.findOne({ _id: id })
        .populate({
            path: 'category',
            select: '_id name'
        })
        .populate({
            path: 'talent',
            select: '_id name role image',
            populate: {
                path: 'image',
                select: '_id name'
            }
        })

    if (!result) throw new NotFoundError('Event not found')

    return result
}

const updateEvents = async (req) => {
    const { id } = req.params
    const {
        title,
        date,
        about,
        tagline,
        keyPoint,
        venueName,
        statusEvent,
        tickets,
        image,
        category,
        talent
    } = req.body

    // search image, category dan talent dari field id nya
    await checkingImage(image)
    await checkingCategories(category)
    await checkingTalents(talent)

    const checkEvent = await Events.findOne({ _id: id })

    if (!checkEvent) throw new NotFoundError('Event not found')

    const check = await Events.findOne({ title, _id: { $ne: id } })
    if (check) throw new BadRequestError('Title must be unique')

    const result = await Events.findOneAndUpdate(
        { _id: id },
        {
            title,
            date,
            about,
            tagline,
            keyPoint,
            venueName,
            statusEvent,
            tickets,
            image,
            category,
            talent
        },
        { new: true, runValidators: true }
    )

    return result
}

const changeStatusEvent = async (req) => {
    const { id } = req.params
    const { status } = req.body

    const event = await Events.findOne({ _id: id })

    if (!event) throw new NotFoundError('Event not found')

    const result = await Events.findOneAndUpdate(
        { _id: id },
        { statusEvent: status },
        { new: true, runValidators: true }
    )

    return result
}

const deleteEvents = async (req) => {
    const { id } = req.params

    const result = await Events.findOne({ _id: id })

    if (!result) throw new NotFoundError('Event not found')

    await result.remove()

    return result
}

module.exports = { getAllEvents, createEvents, getOneEvents, updateEvents, changeStatusEvent, deleteEvents }