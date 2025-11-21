import numpy as np


class DataCloud:
    N = 0

    def __init__(self, x):
        self.n = 1
        self.mean = x
        self.variance = 0.0
        self.pertinency = 1.0
        self.eccAn = 0.0
        DataCloud.N += 1

    def addDataClaud(self, x):
        self.n = 2
        self.mean = (self.mean + x) / 2.0
        self.variance = (np.linalg.norm(self.mean - x)) ** 2

    def updateDataCloud(self, n, mean, variance):
        self.n = n
        self.mean = mean
        self.variance = variance


class AutoCloud:
    c = np.array([DataCloud(0)], dtype=DataCloud)
    alfa = np.array([0.0], dtype=float)
    matrixIntersection = np.zeros((1, 1), dtype=int)
    listIntersection = np.zeros((1,), dtype=int)
    relevanceList = np.zeros((1,), dtype=float)
    classIndex = []
    k = 1

    def __init__(self, m: float):
        AutoCloud.m = m
        AutoCloud.c = np.array([DataCloud(0)], dtype=DataCloud)
        AutoCloud.alfa = np.array([0.0], dtype=float)
        AutoCloud.matrixIntersection = np.zeros((1, 1), dtype=int)
        AutoCloud.listIntersection = np.zeros((1,), dtype=int)
        AutoCloud.relevanceList = np.zeros((1,), dtype=float)
        AutoCloud.classIndex = []
        AutoCloud.k = 1


    def mergeClouds(self):
        i = 0
        while i < len(AutoCloud.listIntersection) - 1:
            merge = False
            j = i + 1

            while j < len(AutoCloud.listIntersection):

                # Se ambas aceitaram o ponto
                if (
                    AutoCloud.listIntersection[i] == 1
                    and AutoCloud.listIntersection[j] == 1
                ):
                    AutoCloud.matrixIntersection[i, j] += 1

                nI = AutoCloud.c[i].n
                nJ = AutoCloud.c[j].n
                meanI = AutoCloud.c[i].mean
                meanJ = AutoCloud.c[j].mean
                varianceI = AutoCloud.c[i].variance
                varianceJ = AutoCloud.c[j].variance
                nIntersc = AutoCloud.matrixIntersection[i, j]

                # critério de merge
                if nIntersc > (nI - nIntersc) or nIntersc > (nJ - nIntersc):
                    merge = True

                    n = nI + nJ - nIntersc
                    mean = ((nI * meanI) + (nJ * meanJ)) / (nI + nJ)
                    variance = (
                        ((nI - 1) * varianceI) + ((nJ - 1) * varianceJ)
                    ) / (nI + nJ - 2)

                    newCloud = DataCloud(mean)
                    newCloud.updateDataCloud(n, mean, variance)

                    AutoCloud.listIntersection = np.concatenate(
                        (
                            AutoCloud.listIntersection[:i],
                            np.array([1]),
                            AutoCloud.listIntersection[i + 1 : j],
                            AutoCloud.listIntersection[j + 1 :],
                        ),
                        axis=None,
                    )

                    AutoCloud.c = np.concatenate(
                        (
                            AutoCloud.c[:i],
                            np.array([newCloud]),
                            AutoCloud.c[i + 1 : j],
                            AutoCloud.c[j + 1 :],
                        ),
                        axis=None,
                    )

                j += 1

            if merge:
                i = 0
            else:
                i += 1


    def run(self, X):
        AutoCloud.listIntersection = np.zeros(
            (np.size(AutoCloud.c)), dtype=int
        )

        if AutoCloud.k == 1:
            AutoCloud.c[0] = DataCloud(X)
            AutoCloud.classIndex.append(0)

        elif AutoCloud.k == 2:
            AutoCloud.c[0].addDataClaud(X)
            AutoCloud.classIndex.append(0)

        elif AutoCloud.k >= 3:
            i = 0
            createCloud = True
            AutoCloud.alfa = np.zeros(
                (np.size(AutoCloud.c)), dtype=float
            )

            for data in AutoCloud.c:
                n = data.n + 1
                mean = ((n - 1) / n) * data.mean + (1 / n) * X
                variance = ((n - 1) / n) * data.variance + (
                    (1 / n) * (np.linalg.norm(X - mean)) ** 2
                )

                eccentricity = (1 / n) + (
                    (mean - X).T.dot(mean - X)
                ) / (n * variance)

                typicality = 1 - eccentricity
                norm_ecc = eccentricity / 2
                norm_typ = typicality / (AutoCloud.k - 2)

                data.eccAn = eccentricity

                if norm_ecc <= (AutoCloud.m**2 + 1) / (2 * n):
                    data.updateDataCloud(n, mean, variance)
                    AutoCloud.alfa[i] = norm_typ
                    createCloud = False
                    AutoCloud.listIntersection[i] = 1
                else:
                    AutoCloud.alfa[i] = 0
                    AutoCloud.listIntersection[i] = 0

                i += 1

            if createCloud:
                AutoCloud.c = np.append(AutoCloud.c, DataCloud(X))
                AutoCloud.listIntersection = np.insert(
                    AutoCloud.listIntersection, i, 1
                )
                AutoCloud.matrixIntersection = np.pad(
                    AutoCloud.matrixIntersection,
                    ((0, 1), (0, 1)),
                    "constant",
                    constant_values=0,
                )

            self.mergeClouds()
            AutoCloud.relevanceList = AutoCloud.alfa / np.sum(
                AutoCloud.alfa
            )

            classIndex = int(np.argmax(AutoCloud.relevanceList))
            AutoCloud.classIndex.append(classIndex)

        AutoCloud.k += 1


def filter_time(signal_input, e1=20, e2=60):
    result = []
    for i in range(e1):
        result.append(0)
    for i in range(e1, len(signal_input)):
        if (
            signal_input[i] == 0
            and np.sum(signal_input[i - e1 : i] == signal_input[i]) == e1
        ):
            result.append(signal_input[i])
        elif (
            signal_input[i] != 0
            and np.sum(signal_input[i - e2 : i] == signal_input[i]) == e2
        ):
            result.append(signal_input[i])
        else:
            result.append(result[len(result) - 1])
    return np.array(result)