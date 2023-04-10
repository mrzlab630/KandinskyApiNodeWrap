/**
 *
 * by mrZ
 * Email: mrZ@mrZLab630.pw
 * Date: 2023-04-07
 * Time: 16:44
 * About:
 *
 */
import fetch from 'node-fetch'


export type TKandinskyApiNodeWrapStyle = 'middleAges'| 'anime' | 'ultra' | 'cyberpunk' | 'kandinsky' | 'aivazovsky' |'malevich' | 'picasso' | 'goncharova' | 'classicism' | 'renaissance' |'oilPainting' |'pencil' |'digital' | 'sovietCartoons' | 'unreal' | 'cartoon' | 'glamorous' |'portrait' |'mosaic' |'icon' |'khokhloma' |'christmas'




class KandinskyApiNodeWrap {

    private apiUrl:string
    private routRequest:string
    private routRun:string
    private routStatus:string
    private routResult:string
    private requestDelay:number
    private userAgent: string
    private origin:string


    constructor(){
        this.requestDelay = 30000
        this.apiUrl = 'https://fusionbrain.ai/api/v1/text2image/'
        this.routRequest = 'generate/pockets/'
        this.routRun = 'run'
        this.routStatus = '/status'
        this.routResult = '/entities'
        this.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
        this.origin = 'https://fusionbrain.ai'
    }

    public styles(k?:TKandinskyApiNodeWrapStyle):{[k in TKandinskyApiNodeWrapStyle]: string}| string {

        const list:{[k in TKandinskyApiNodeWrapStyle]: string} = {
            middleAges:'medieval painting, 15th century, trending on artstation',
            anime:'in anime style',
            ultra:'4k, ultra HD, detailed photo',
            cyberpunk:'in cyberpunk style, futuristic cyberpunk',
            kandinsky:'painted by Vasily Kandinsky, abstractionis',
            aivazovsky:'painted by Aivazovsky',
            malevich:'Malevich, suprematism, avant-garde art, 20th century, geometric shapes , colorful, Russian avant-garde',
            picasso:'Cubist painting by Pablo Picasso, 1934, colourful',
            goncharova:'painted by Goncharova, Russian avant-garde, futurism, cubism, suprematism',
            classicism:'classicism painting, 17th century, trending on artstation, baroque painting',
            renaissance:'painting, renaissance old master royal collection, artstation',
            oilPainting:'like oil painting',
            pencil:'pencil art, pencil drawing, highly detailed',
            digital:'high quality, highly detailed, concept art, digital painting, by greg rutkowski trending on artstation',
            sovietCartoons:'picture from soviet cartoons',
            unreal:'Unreal Engine rendering, 3d render, photorealistic, digital concept art, octane render, 4k HD',
            cartoon:'as cartoon, picture from cartoon',
            glamorous:'glamorous, emotional ,shot in the photo studio, professional studio lighting, backlit, rim lighting, 8k',
            portrait:'50mm portrait photography, hard rim lighting photography',
            mosaic:'as tile mosaic',
            icon:'in the style of a wooden christian medieval icon in the church',
            khokhloma:'in Russian style, Khokhloma, 16th century, marble, decorative, realistic',
            christmas:'Новый год - christmas, winter, x-mas, decorations, new year eve, snowflakes, 4k'
        }

        if(!k){
            return list
        }

        if(!Object.keys(list).filter(itm => itm === k)?.pop()){
            return list
        }



        return list[k]
    }

    public async run(prompt:string, style?:TKandinskyApiNodeWrapStyle){
        try {

            const getStyle = style ? this.styles(style) : null

            const data = {
                queueType: 'generate',
                query:prompt,
                style:getStyle,
                preset:1
            }


            const fetchPrediction = await fetch(
                this.apiUrl+this.routRun,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': this.userAgent,
                        'Origin':this.origin
                    },
                    body: JSON.stringify(data)
                }
            )

            const result:any =  await fetchPrediction.json()

            if(!result?.success){
                throw new Error(result?.message || 'Bad request')
            }

            const {pocketId} = result.result

            if(!pocketId){
                throw new Error('pocketId is empty')
            }

            return {result:pocketId}

        }catch (e) {
            return {error:(e as Error).message}
        }
    }

    public async getRequest(p:{pocketId: string, rout:string}):Promise<{
        result?:string,
        success:boolean,
        error?:string
    }> {
        try {

            const {pocketId,rout} = p


            if(!pocketId){
                throw new Error('pocketId is empty')
            }

            const fetchPrediction = await fetch(
                this.apiUrl+this.routRequest+pocketId+rout,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': this.userAgent,
                        'Origin':this.origin
                    }
                }
            )

            return await fetchPrediction.json() as any

        }catch (e) {
            return {
                error: (e as Error)?.message,
                success:false
            }
        }
    }


    public async getStatus(pocketId:string):Promise<{result?:string,success:boolean,error?:string}> {
        try {
            return await this.getRequest({pocketId, rout:this.routStatus})
        }catch (e) {
            return {
                error: (e as Error)?.message,
                success:false
            }
        }
    }

    public async statusCheck(pocketId:string): Promise<{error?:string,success:boolean}>{
        try {
            if(!pocketId){
                throw new Error('pocketId is empty')
            }

            const {result:status,error} = await this.getStatus(pocketId)

            if(error || !status){
                throw new Error(error || 'unknown error')
            }

            switch (status.toLowerCase()) {

                case 'initial':
                case 'processing':
                    await new Promise(resolve => setTimeout(resolve, this.requestDelay))
                    return this.statusCheck(pocketId)

                default:
                    return {success:true}
            }

        }catch (e) {
            return {error: (e as Error)?.message, success:false}
        }
    }
    public async getResult(pocketId:string):Promise<{result?:string,success:boolean,error?:string}> {
        try {
            return await this.getRequest({pocketId, rout:this.routResult})
        }catch (e) {
            return {
                error: (e as Error)?.message,
                success:false
            }
        }
    }

    public async generate(prompt:string, style?:TKandinskyApiNodeWrapStyle):Promise<{error?:string,result?:any}>{
        try {
            const {error:runErr,result:pocketId} = await this.run(prompt,style)

            if(runErr){
                throw new Error(runErr)
            }

            const {success, error:chkErr} = await this.statusCheck(pocketId)

            if(chkErr){
                throw new Error(chkErr)
            }
            if(!success){
                throw new Error('unknown error')
            }

            const result = await this.getResult(pocketId)


            return {result}

        }catch (e) {
            return {error: (e as Error)?.message}
        }
    }


}



export default KandinskyApiNodeWrap