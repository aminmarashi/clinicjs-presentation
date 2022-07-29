import { transform } from "./materialTransformer";

const materials = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 -/,";

async function loadTest() {
    console.log('Starting load test...');
    await ioCpu(generateRandomMaterial(materials, 100), 100, 1000);
    await cpuOnly(generateRandomMaterial(materials, 100), 100);
    await memoryOnly(generateRandomMaterial(materials, 100), 100);
    await memoryAndCpu(generateRandomMaterial(materials, 100), 100);
    await ioOnly(generateRandomMaterial(materials, 100), 100, 1000);
    await memoryCpuAndIo(generateRandomMaterial(materials, 100), 100, 1000);
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
    const materials = [];
    for (let i = 0; i < count; i++) {
        try {
            materials.push(materialGenerator());
        } catch { }
    }
}

async function memoryAndCpu(materialGenerator, count) {
    const materials = [];
    for (let i = 0; i < count; i++) {
        try {
            materials.push(transform(materialGenerator()));
        } catch { }
    }
}

async function memoryCpuAndIo(materialGenerator, count, delay) {
    const materials = [];
    for (let i = 0; i < count; i++) {
        try {
            materials.push(transform(materialGenerator()));
        } catch { }
    }
}

loadTest().catch(console.error);
