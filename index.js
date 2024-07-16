const path = require("path");
const fs = require('fs-extra');

const startPath = path.join('./.src');
const sizeOf = require("image-size");

const { compress } = require('compress-images/promise');
const sharp = require('sharp');

const processImages = async (input, output) => {
    const result = await compress({
        source: input,
        destination: output,
        enginesSetup: {
            jpg: { engine: 'mozjpeg', command: ['-quality', '60']},
            png: { engine: 'pngquant', command: ['--quality=20-50', '-o']},
        }
    });

    const { statistics, errors } = result;
};
function processImagesSharp(input, output, width, height){
	return new Promise((resolve)=>{
		sharp(input)
		  .rotate()
		  .resize(Math.round(width), Math.round(height), {
			  fit: 'inside'
		  })
		  .toFile(output, (err, info) => {
			  resolve(info);
		  });
	});
}

function compressImage(){
	return new Promise((resolve)=>{
		fs.readdir(startPath, async (err, files) => {
		  for(let file of files){
			  console.log(file, 'compressing');
			  await processImages('./.src/'+file,'./.dist/compressed/');
		  }
		  
		  resolve('ok');
		});
	});
}

function resizeImage(){
	return new Promise((resolve)=>{
		fs.readdir(startPath, async (err, files) => {
		  for(let file of files){
			console.log(file, 'resizing');

			const dimensions = sizeOf('./.src/'+file)
			
			let width = dimensions.width / 2;
			let height = dimensions.height / 2;
			
			while(width > 768){
				width = width / 2;
				height = height / 2;
			}
			
			await processImagesSharp('./.src/'+file,'./.dist/resized/'+file, width, height);
		  }
		  
		  resolve('ok');
		});
	});
}

async function main(){
	const src = path.join(__dirname,'.src');
	const compressed = path.join(__dirname,'.dist/compressed');
	const resized = path.join(__dirname,'.dist/resized');
	
	if(!fs.existsSync(src))
		fs.mkdirSync(src);
	
	if(!fs.existsSync(compressed))
		fs.mkdirSync(compressed, {recursive: true});
	
	if(!fs.existsSync(resized))
		fs.mkdirSync(resized, {recursive: true});
	
	await compressImage();
	await resizeImage();
}

main();