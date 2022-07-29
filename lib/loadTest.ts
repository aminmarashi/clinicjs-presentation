import { transform } from "./materialTransformer";

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const numbers = '0123456789';
const punctuations = ' .!?()[]{}';
const special = ';:,';

const materials = letters + numbers + punctuations + special;
const materialsLength = 100;
const materialsLIst = [];

async function loadTest() {
    console.log('Starting load test...');
    const count = 1000;
    const delay = 1;
    await ioCpu(generateRandomMaterial(materials, materialsLength), count, delay);
    await cpuOnly(generateRandomMaterial(materials, materialsLength), count);
    await memoryOnly(generateRandomMaterial(materials, materialsLength), count);
    await memoryAndCpu(generateRandomMaterial(materials, materialsLength), count);
    await ioOnly(generateRandomMaterial(materials, materialsLength), count, delay);
    await memoryCpuAndIo(generateRandomMaterial(materials, materialsLength), count, delay);
}

function generateRandomMaterial(chars, len) {
    return () => randomString(chars, len);
}

function randomString(chars, len) {
    return [...Array(len)].reduce(a=>a+chars[~~(Math.random()*chars.length)],'');
}

async function ioCpu(materialGenerator, count, delay) {
    for (let i = 0; i < count; i++) {
        await new Promise(resolve => setTimeout(resolve, delay));
        try {
            transform(materialGenerator())
        } catch { }
    }
}

async function cpuOnly(materialGenerator, count) {
    for (let i = 0; i < count; i++) {
        try {
            transform(materialGenerator())
        } catch { }
    }
}

async function ioOnly(materialGenerator, count, delay) {
    for (let i = 0; i < count; i++) {
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

async function memoryOnly(materialGenerator, count) {
    for (let i = 0; i < count; i++) {
        try {
            materialsLIst.push(materialGenerator());
        } catch { }
    }
}

async function memoryAndCpu(materialGenerator, count) {
    for (let i = 0; i < count; i++) {
        try {
            materialsLIst.push(transform(materialGenerator()));
        } catch { }
    }
}

async function memoryCpuAndIo(materialGenerator, count, delay) {
    for (let i = 0; i < count; i++) {
        try {
            materialsLIst.push(transform(materialGenerator()));
        } catch { }
    }
}

loadTest().catch(console.error);
