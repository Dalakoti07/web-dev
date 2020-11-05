file=open('sample.txt',"w")
for i in range(0,80):
    # print("file : /images/{}".format(str(i).zfill(2)))
    file.write("\n\n![image](/jquery/j-query-images/"+str(i).zfill(2)+".png)")
file.close()