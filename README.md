# KandinskyApiNodeWrap

### Node.js wrapper for Kandinsky 2.1 === fusionbrain.ai (unofficial)

***


# Node.js обертка для запросов к Kandinsky 2.1 === fusionbrain.ai

***Обертка использует не официальное API сайта fusionbrain.ai***

т.е. все проблемы вы берене на себя.


***


### Example

```

import KandinskyApiNodeWrap, {TKandinskyApiNodeWrapStyle} from "./KandinskyApiNodeWrap"

...

 try {
 
        const debug = false
        const kAgent = new KandinskyApi(debug)
        
        /// a list of available styles
        const styles = kAgent.styles()
        
        const prompt = 'green cat'
        const style:TKandinskyApiNodeWrapStyle = 'cartoon'
        const {result, error} = await kAgent.generate(prompt,style)

        return result

 }catch (e) {
        return {error:e.message}
 }

```